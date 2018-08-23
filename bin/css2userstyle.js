#!/usr/bin/env node

'use strict';


// TODO:
//  - Robust prop checks for userstyle_props
//  - Setup include/match/domain checks in metadata
//  - Handle various other meta properties, @vars, etc.



const fs = require('fs');
const path = require('path');
const byline = require('byline');
const through = require('through2');

const yargs = require('yargs');
const argv = yargs
  .usage("$0 <style.css> [options]")
  .demand(1)
  .options({
    'basename': {
      'alias':       'b',
      'describe':    'Basename of output file(s), to which .user.css or .user.js will be appended',
      'requiresArg': true,
      'type':        'string'
    },
    'output': {
      'alias':       'o',
      'describe':    'Output directory',
      'requiresArg': true,
      'type':        'string'
    },
    'replace': {
      'describe': 'The user.css file will replace the source file'
    },
    'usercss-only': {
      'describe': 'Output only the user.css file'
    },
    'userjs-only': {
      'describe': 'Output only the user.js & meta.js files'
    }
  })
  .help()
  .version()
  .argv;


const srcPathname = path.normalize(argv._.pop());
const srcPathParts = path.parse(srcPathname);

const destDir = argv['output'] ? argv['output'] : srcPathParts.dir;
const destBasename = argv['basename'] ? argv['basename'] : srcPathParts.name;

const metaJSFilename = path.join(destDir, destBasename + '.meta.js');
const userJSFilename = path.join(destDir, destBasename + '.user.js');
const userCSSFilename = path.join(destDir, destBasename + '.user.css');


const source = fs.createReadStream(srcPathname, { encoding: 'utf8' });
const lineStream = byline.createStream(source);

const metaJS = fs.createWriteStream(metaJSFilename, { encoding: 'utf8'});
const userJS = fs.createWriteStream(userJSFilename, { encoding: 'utf8'});
const userCSS = fs.createWriteStream(userCSSFilename, { encoding: 'utf8'});


const userstyle_props = {
  'name': {
    'required': true
  },
  'description': "",
  'version': {
    'required': true
  },
  'author': "",
  'license': "",
  'namespace': {
    'required': true
  },
  'homepageURL': "",
  'supportURL': "",
  'updateBaseURL': "",
  'updateURL': "",
  'downloadURL': {
    usercss: false
  },
  'preprocessor': "",
  'run-at': {
    'default': 'document-start',
    'usercss': false
  }
};

let longestPropLength = 0;
for (let prop in userstyle_props) {
  longestPropLength = prop.length > longestPropLength ? prop.length : longestPropLength;
}

function _padPropName(name, length) {
  while (name.length < length) name += ' ';
  return name;
}

const meta = resolveMeta();



// === setup user.css conversion ===

function formatUserstyleCSSHeader(meta) {
  let CSSmeta = JSON.parse(JSON.stringify(meta)); // local copy

  // Fix-ups
  if (_safePropGet('updateURL', CSSmeta)) {
    CSSmeta['updateURL'] += '.user.css';
  }

  let header = '';
  header += `/* ==UserStyle==\n`;

  for (let prop in userstyle_props) {
    if (  _safePropGet(prop, CSSmeta) && _isAllowedCSSMetaProp(prop) ) {
      header += `@${ _padPropName(prop, longestPropLength) } ${ CSSmeta[prop] }\n`;
    }
  }

  header += `==/UserStyle== */\n`;
  return header;
}


userCSS.write(formatUserstyleCSSHeader(meta));
userCSS.write(`@-moz-document domain("domain.com") {\n`);

let toUserCSS = through(
  function write (line, enc, next) {
    this.push(`  ${ line }\n`);
    next();
  },
  function flush(flush) {
    this.push('};');
    flush();
  }
);

lineStream.pipe(toUserCSS).pipe(userCSS);



// === setup user.js conversion ===

function formatUserJSHeader(meta) {
  let JSmeta = JSON.parse(JSON.stringify(meta)); // local copy

  // Fix-ups
  if (_safePropGet('updateURL', JSmeta)) {
    JSmeta['updateURL'] = JSmeta['updateURL'] + '.meta.js';
  }

  if (_safePropGet('downloadURL', JSmeta)) {
    JSmeta['downloadURL'] += '.user.js';
  }

  let header = '';
  header += `// ==UserScript==\n`;

  for (let prop in userstyle_props) {
    if ( _safePropGet(prop, JSmeta) && _isAllowedJSMetaProp(prop) ) {
      header += `// @${ _padPropName(prop, longestPropLength) } ${ JSmeta[prop] }\n`;
    }
  }

  header += `// ==/UserScript==\n`;
  return header;
}


const userJSHeader = formatUserJSHeader(meta);
metaJS.write(userJSHeader);
userJS.write(userJSHeader);
userJS.write(`(function() {var css = [\n`);

let toUserJS = through(
  function write(line, enc, next) {
    let s = line.toString('utf8');
    s = s.replace(/\\/g, '\\\\');
    s = s.replace(/(["'])/g, "\\$1");
    s = `  "  ${s}",\n`;
    this.push(Buffer.from(s, 'utf8'));
    next();
  },
  function flush(flush) {
    const foot =
`  ""
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
    flush();
  }
);

lineStream.pipe(toUserJS).pipe(userJS);



// === Resolve metadata ===

function resolveMeta() {
  const userstyleJSON = _readMeta('userstyle.json') || {};
  const packageJSON = _readMeta('package.json') || {};
  const package_userstyle = _safePropGet('userstyle', packageJSON, {});

  let meta = {};

  for (let prop in userstyle_props) {
    meta[prop] = _getFirstPropOf(prop, [userstyleJSON, package_userstyle, packageJSON]);
    if (meta[prop] == undefined && typeof userstyle_props[prop] === 'object') {
      meta[prop] = _safePropGet('default', userstyle_props[prop]);
    }
  }

  // fix-ups
  if (_safePropGet('updateBaseURL', meta)) {
    let url = meta['updateBaseURL'];
    if (url[url.length-1] != '/') url += '/';
    meta['updateURL'] = url + destBasename;
    delete meta['updateBaseURL'];
  }

  if (_safePropGet('updateURL', meta) && !_safePropGet('downloadURL', meta)) {
    // TODO: handle *.user.js vs *.meta.js naming
    // as well as *.js vs *.css
    meta['downloadURL'] = meta['updateURL'];
  }

  return meta;

  function _readMeta(filename) {
    let meta = {};
    try {
      fs.accessSync(filename, fs.constants.F_OK | fs.constants.R_OK);
      const raw = fs.readFileSync(filename, 'utf8');
      meta = JSON.parse(raw);
    } catch (err) {
      // return empty
    }

    return meta;
  }
}



// === Utility ===

function _safePropGet(prop, obj, def = undefined) {
  const result = (obj == null) ? undefined : obj[prop];
  return (result !== undefined) ? result : def;
}

function _getFirstPropOf(prop, objs) {
  let result = objs.find(obj => _safePropGet(prop, obj));
  return _safePropGet(prop, result);
}

function _isAllowedCSSMetaProp(prop) {
  return ! ( typeof userstyle_props[prop] === 'object' && !_safePropGet('usercss', userstyle_props[prop], true) );
}

function _isAllowedJSMetaProp(prop) {
  return ! ( typeof userstyle_props[prop] === 'object' && !_safePropGet('userjs', userstyle_props[prop], true) );
}
