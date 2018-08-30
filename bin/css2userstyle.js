#!/usr/bin/env node

// TODO:
//  - Robust prop checks for userstyleSpec
//  - Handle various other meta properties, @vars, etc.

const fs = require('fs');
const path = require('path');
const byline = require('byline');
const through = require('through2');
const url = require('url');

const yargv = require('yargs')
  .usage('$0 <style.css> [options]')
  .demand(1)
  .options({
    basename: {
      alias: 'b',
      describe:
        'Basename of output file(s), to which .user.css or .user.js will be appended',
      requiresArg: true,
      type: 'string'
    },
    output: {
      alias: 'o',
      describe: 'Output directory',
      requiresArg: true,
      type: 'string'
    },
    'usercss-only': {
      describe: 'Output only the user.css file'
    },
    'userjs-only': {
      describe: 'Output only the user.js & meta.js files'
    }
  })
  .help()
  .version().argv;

const srcPathname = path.normalize(yargv._.pop());
const srcPathParts = path.parse(srcPathname);

const destDir = yargv.output ? yargv.output : srcPathParts.dir;
const destBasename = yargv.basename ? yargv.basename : srcPathParts.name;

const metaJSFilename = path.join(destDir, `${destBasename}.meta.js`);
const userJSFilename = path.join(destDir, `${destBasename}.user.js`);
const userCSSFilename = path.join(destDir, `${destBasename}.user.css`);

const source = fs.createReadStream(srcPathname, { encoding: 'utf8' });
const lineStream = byline.createStream(source);

const metaJS = fs.createWriteStream(metaJSFilename, { encoding: 'utf8' });
const userJS = fs.createWriteStream(userJSFilename, { encoding: 'utf8' });
const userCSS = fs.createWriteStream(userCSSFilename, { encoding: 'utf8' });

const userstyleSpec = {
  name: {
    required: true
  },
  description: '',
  version: {
    required: true
  },
  author: '',
  license: '',
  namespace: {
    required: true
  },
  homepageURL: '',
  supportURL: '',
  updateBaseURL: '',
  updateURL: {
    derived: true
  },
  downloadURL: {
    derived: true,
    usercss: false
  },
  preprocessor: '',
  'run-at': {
    default: 'document-start',
    usercss: false
  },
  match: ''
};

let longestPropLength = 0;
Object.keys(userstyleSpec).forEach(prop => {
  longestPropLength = prop.length > longestPropLength ? prop.length : longestPropLength;
});

function _padPropName(name, length) {
  let paddedName = name;
  while (paddedName.length < length) paddedName += ' ';
  return paddedName;
}

const [userCSSmeta, userJSmeta] = resolveMeta();

/*
 *
 *  === setup user.css conversion ===
 *
 */

function formatUserstyleCSSHeader(metadata) {
  const CSSmeta = JSON.parse(JSON.stringify(metadata)); // Local copy

  let header = '';
  header += '/* ==UserStyle==\n';

  let documentRules;

  Object.keys(userstyleSpec).forEach(prop => {
    if (_safePropGet(prop, CSSmeta) && _isAllowedCSSMetaProp(prop)) {
      if (prop === 'match') {
        documentRules = metadata.match;
      } else {
        header += `@${_padPropName(prop, longestPropLength)} ${CSSmeta[prop]}\n`;
      }
    }
  });

  header += '==/UserStyle== */\n';
  if (documentRules && Object.keys(documentRules).length) {
    header += `@-moz-document\n  ${documentRules.join(',\n  ')}\n{\n`;
  }
  return header;
}

userCSS.write(formatUserstyleCSSHeader(userCSSmeta));

const toUserCSS = through(
  function write(line, enc, nextFn) {
    this.push(`  ${line}\n`); // TODO: Here and JS, don't indent if there are no document rules.
    nextFn();
  },
  function flush(flushFn) {
    if (userCSSmeta.match && userCSSmeta.match.length) this.push('};');
    flushFn();
  }
);

lineStream.pipe(toUserCSS).pipe(userCSS);

/*
 *
 *  === setup user.js conversion ===
 *
 */

function formatUserJSHeader(metadata) {
  const JSmeta = JSON.parse(JSON.stringify(metadata)); // Local copy

  let header = '';
  header += '// ==UserScript==\n';

  Object.keys(userstyleSpec).forEach(prop => {
    if (_safePropGet(prop, JSmeta) && _isAllowedJSMetaProp(prop)) {
      if (prop === 'match') {
        _safePropGet(prop, JSmeta).forEach(include => {
          header += `// @${_padPropName('include', longestPropLength)} ${include}\n`;
        });
      } else {
        header += `// @${_padPropName(prop, longestPropLength)} ${JSmeta[prop]}\n`;
      }
    }
  });

  header += '// ==/UserScript==\n';
  return header;
}

const userJSHeader = formatUserJSHeader(userJSmeta);
metaJS.write(userJSHeader);
userJS.write(userJSHeader);
userJS.write('(function() {var css = [\n');

const toUserJS = through(
  function write(line, enc, nextFn) {
    let s = line.toString('utf8');
    s = s.replace(/\\/g, '\\\\');
    s = s.replace(/(["'])/g, '\\$1');
    s = `  "  ${s}",\n`;
    this.push(Buffer.from(s, 'utf8'));
    nextFn();
  },
  function flush(flushFn) {
    const foot = `  ""
].join("\\n");
if (typeof GM_addStyle != "undefined") {
  GM_addStyle(css);
} else if (typeof PRO_addStyle != "undefined") {
  PRO_addStyle(css);
} else if (typeof addStyle != "undefined") {
  addStyle(css);
} else {
  var node = document.createElement("style");
  node.type = "text/css";
  node.appendChild(document.createTextNode(css));
  var heads = document.getElementsByTagName("head");
  if (heads.length > 0) {
    heads[0].appendChild(node);
  } else {
    // no head yet, stick it whereever
    document.documentElement.appendChild(node);
  }
}
})();
`;
    this.push(foot);
    flushFn();
  }
);

lineStream.pipe(toUserJS).pipe(userJS);

/*
 *
 *  === Resolve metadata ===
 *
 */

function resolveMeta() {
  const userstyleJSON = _readMeta('userstyle.json') || {};
  const packageJSON = _readMeta('package.json') || {};
  const packageUserstyle = _safePropGet('userstyle', packageJSON, {});

  const CSSMeta = {};
  const JSMeta = {};

  // TODO: Handle case where no value & no default
  Object.entries(userstyleSpec).forEach(entry => {
    const [prop, spec] = entry;
    let value = _getFirstPropOf(prop, [userstyleJSON, packageUserstyle, packageJSON]);
    const isObjectSpec = typeof userstyleSpec[prop] === 'object';

    // Assign default value if no value given
    if (typeof value === 'undefined' && isObjectSpec) {
      value = _safePropGet('default', spec);
    }

    // Fix-ups
    if (prop === 'author' && typeof value === 'object') {
      const authorName = _safePropGet('name', value);
      const authorEmail = _safePropGet('email', value);
      const authorUrl = _safePropGet('url', value);

      value = authorName;
      if (typeof authorEmail !== 'undefined') value += ` <${authorEmail}>`;
      if (typeof authorUrl !== 'undefined') value += ` (${authorUrl})`;
    }

    if (prop === 'match') {
      if (typeof value !== 'object') _croak(`Value for '${prop}' is invalid type!`);
      const matchCSS = [];
      const matchJS = [];
      Object.keys(value).forEach(matchType => {
        if (typeof value[matchType] === 'string') {
          _validateMatchURL(value[matchType], matchType);
          matchCSS.push(_userstyleMatchtoUserCSSMatch(value[matchType], matchType));
          matchJS.push(..._userstyleMatchtoUserJSMatch(value[matchType], matchType));
        } else {
          value[matchType].forEach(matchTypeValue => {
            _validateMatchURL(matchTypeValue, matchType);
            matchCSS.push(_userstyleMatchtoUserCSSMatch(matchTypeValue, matchType));
            matchJS.push(..._userstyleMatchtoUserJSMatch(matchTypeValue, matchType));
          });
        }
      });
      CSSMeta.match = matchCSS;
      JSMeta.match = matchJS;
    } else if (prop === 'updateBaseURL') {
      if (value[value.length - 1] !== '/') value += '/';
      CSSMeta.updateURL = `${value + destBasename}.user.css`;
      JSMeta.updateURL = `${value + destBasename}.meta.js`;
      JSMeta.downloadURL = `${value + destBasename}.user.js`;
    } else if (isObjectSpec && _safePropGet('derived', spec) === true) {
      // do nothing for derived properties
    }
    // Assign to userjs and/or usercss meta objects as specified
    else if (isObjectSpec && _safePropGet('usercss', spec) === false) {
      JSMeta[prop] = value;
    } else if (isObjectSpec && _safePropGet('userjs', spec) === false) {
      CSSMeta[prop] = value;
    } else {
      CSSMeta[prop] = value;
      JSMeta[prop] = value;
    }
  });

  return [CSSMeta, JSMeta];

  function _readMeta(filename) {
    let metadata = {};
    try {
      fs.accessSync(filename, fs.constants.F_OK | fs.constants.R_OK); // eslint-disable-line no-bitwise
      const raw = fs.readFileSync(filename, 'utf8');
      metadata = JSON.parse(raw);
    } catch (err) {
      // Return empty
    }

    return metadata;
  }
}

function _validateMatchURL(match, type) {
  const validURL = url.parse(match);
  const containsWildcard = match.match(/\*/);

  switch (type) {
    case 'url':
      if (typeof validURL.protocol !== 'string' || containsWildcard) {
        _croak(
          `Invalid 'url' rule: '${match}'\n` +
            'URL rules should contain a URL you want to affect, including protocol. Wildcards are not permitted.'
        );
      }
      break;
    case 'url-prefix':
      if (typeof validURL.protocol !== 'string' || containsWildcard) {
        _croak(
          `Invalid 'url-prefix' rule: '${match}'\n` +
            'URL prefix rules should contain the start of URLs you want to affect, including protocol. Wildcards are not permitted.'
        );
      }
      break;
    case 'domain':
      if (
        typeof validURL.protocol === 'string' ||
        typeof validURL.port === 'string' ||
        containsWildcard
      ) {
        _croak(
          `Invalid 'domain' rule: '${match}'\n` +
            'Domain rules should just be the domain name, without protocol, port, or wildcards. A domain rule will affect all pages on that domain and all of its subdomains.'
        );
      }
      break;
    default:
      _croak(`Unknown or unsupported match type: '${type}'.`);
  }
}

function _userstyleMatchtoUserCSSMatch(match, type) {
  let documentRule;

  switch (type) {
    case 'url':
      documentRule = `url('${match}')`;
      break;
    case 'url-prefix':
      documentRule = `url-prefix('${match}')`;
      break;
    case 'domain':
      documentRule = `domain('${match}')`;
      break;
    default:
      _croak(`Unknown or unsupported match type: '${type}'.`);
  }
  return documentRule;
}

function _userstyleMatchtoUserJSMatch(match, type) {
  let includeMatch = match;
  const includeURLs = [];
  switch (type) {
    case 'url':
      includeURLs.push(includeMatch);
      break;
    case 'url-prefix':
      if (includeMatch[includeMatch.length - 1] !== '/') includeMatch += '/';
      includeMatch += '*';
      includeURLs.push(includeMatch);
      break;
    case 'domain':
      if (includeMatch[includeMatch.length - 1] !== '/') includeMatch += '/';
      includeURLs.push(`http://${includeMatch}*`);
      includeURLs.push(`https://${includeMatch}*`);
      includeURLs.push(`http://*.${includeMatch}*`);
      includeURLs.push(`https://*.${includeMatch}*`);
      break;
    default:
      _croak(`Unknown or unsupported match type: '${type}'.`);
  }
  return includeURLs;
}

/*
 *
 *  === Utility ===
 *
 */

function _safePropGet(prop, obj, def = undefined) {
  const result = typeof obj === 'undefined' ? undefined : obj[prop];
  return result === undefined ? def : result;
}

function _getFirstPropOf(prop, objs) {
  const result = objs.find(obj => _safePropGet(prop, obj));
  return _safePropGet(prop, result);
}

function _isAllowedCSSMetaProp(prop) {
  return !(
    typeof userstyleSpec[prop] === 'object' &&
    !_safePropGet('usercss', userstyleSpec[prop], true)
  );
}

function _isAllowedJSMetaProp(prop) {
  return !(
    typeof userstyleSpec[prop] === 'object' &&
    !_safePropGet('userjs', userstyleSpec[prop], true)
  );
}

function _croak(msg) {
  if (msg) console.error(msg); // eslint-disable-line no-console
  process.exit(1);
}
