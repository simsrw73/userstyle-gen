#!/usr/bin/env node

// TODO:
//  - Robust prop checks for userstyleProps
//  - Setup include/match/domain checks in metadata
//  - Handle various other meta properties, @vars, etc.

const fs = require('fs');
const path = require('path');
const byline = require('byline');
const through = require('through2');

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
    replace: {
      describe: 'The user.css file will replace the source file'
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

const userstyleProps = {
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
  updateURL: '',
  downloadURL: {
    usercss: false
  },
  preprocessor: '',
  'run-at': {
    default: 'document-start',
    usercss: false
  }
};

let longestPropLength = 0;
Object.keys(userstyleProps).forEach(prop => {
  longestPropLength = prop.length > longestPropLength ? prop.length : longestPropLength;
});

function _padPropName(name, length) {
  let paddedName = name;
  while (paddedName.length < length) paddedName += ' ';
  return paddedName;
}

const meta = resolveMeta();

/*
 *
 *  === setup user.css conversion ===
 *
 */

function formatUserstyleCSSHeader(metadata) {
  const CSSmeta = JSON.parse(JSON.stringify(metadata)); // Local copy

  // Fix-ups
  if (_safePropGet('updateURL', CSSmeta)) {
    CSSmeta.updateURL += '.user.css';
  }

  let header = '';
  header += '/* ==UserStyle==\n';

  Object.keys(userstyleProps).forEach(prop => {
    if (_safePropGet(prop, CSSmeta) && _isAllowedCSSMetaProp(prop)) {
      header += `@${_padPropName(prop, longestPropLength)} ${CSSmeta[prop]}\n`;
    }
  });

  header += '==/UserStyle== */\n';
  return header;
}

userCSS.write(formatUserstyleCSSHeader(meta));
userCSS.write('@-moz-document domain("domain.com") {\n');

const toUserCSS = through(
  function write(line, enc, nextFn) {
    this.push(`  ${line}\n`);
    nextFn();
  },
  function flush(flushFn) {
    this.push('};');
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

  // Fix-ups
  if (_safePropGet('updateURL', JSmeta)) {
    JSmeta.updateURL += '.meta.js';
  }

  if (_safePropGet('downloadURL', JSmeta)) {
    JSmeta.downloadURL += '.user.js';
  }

  let header = '';
  header += '// ==UserScript==\n';

  Object.keys(userstyleProps).forEach(prop => {
    if (_safePropGet(prop, JSmeta) && _isAllowedJSMetaProp(prop)) {
      header += `// @${_padPropName(prop, longestPropLength)} ${JSmeta[prop]}\n`;
    }
  });

  header += '// ==/UserScript==\n';
  return header;
}

const userJSHeader = formatUserJSHeader(meta);
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

  const newMeta = {};

  Object.keys(userstyleProps).forEach(prop => {
    newMeta[prop] = _getFirstPropOf(prop, [userstyleJSON, packageUserstyle, packageJSON]);
    if (newMeta[prop] === undefined && typeof userstyleProps[prop] === 'object') {
      newMeta[prop] = _safePropGet('default', userstyleProps[prop]);
    }
  });

  // Fix-ups
  if (_safePropGet('updateBaseURL', newMeta)) {
    let url = newMeta.updateBaseURL;
    if (url[url.length - 1] !== '/') url += '/';
    newMeta.updateURL = url + destBasename;
    delete newMeta.updateBaseURL;
  }

  if (_safePropGet('updateURL', newMeta) && !_safePropGet('downloadURL', newMeta)) {
    // TODO: handle *.user.js vs *.meta.js naming
    // as well as *.js vs *.css
    newMeta.downloadURL = newMeta.updateURL;
  }

  return newMeta;

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
    typeof userstyleProps[prop] === 'object' &&
    !_safePropGet('usercss', userstyleProps[prop], true)
  );
}

function _isAllowedJSMetaProp(prop) {
  return !(
    typeof userstyleProps[prop] === 'object' &&
    !_safePropGet('userjs', userstyleProps[prop], true)
  );
}
