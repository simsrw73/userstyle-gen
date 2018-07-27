
const path = require('path');
const fs = require('fs');
const os = require('os');


const USERSTYLE_JSON = 'userstyle.json';


module.exports = UserStyle;
function UserStyle () {
  this.meta = this.readUserstyleJSON();
}

UserStyle.prototype.init = function() {
  console.log('init(): not yet implemented.');
}

UserStyle.prototype.parseMetaFromCSS = function() {
  console.log('parseMetaFromCSS(): not yet implemented.');
}

UserStyle.prototype.parseMetaFromJS = function() {
  console.log('parseMetaFromJS(): not yet implemented.');
}

UserStyle.prototype.stringifyCSS = function() {
  console.log('stringifyCSS(): not yet implemented.');
}

UserStyle.prototype.readUserstyleJSON = function() {
  const homeJSON = path.join(os.homedir(), USERSTYLE_JSON);
  const projectJSON = path.join(process.cwd(), USERSTYLE_JSON);

  const homeMeta = this.readMeta(homeJSON);
  const projectMeta = this.readMeta(projectJSON);

  const meta = this.deriveUserstyleJSON(homeMeta, projectMeta);

  return meta;
}

UserStyle.prototype.readMeta = function (filename) {
  let meta;
  try {
    fs.accessSync(filename, fs.constants.F_OK | fs.constants.R_OK);
    let raw = fs.readFileSync(filename, 'utf-8');
    meta = JSON.parse(raw);
  } catch (err) {
    // throw err;
  }

  return meta;
}

function mergeProperty(obj1, obj2, prop) {
  let obj1final = (obj1) ? (obj1[prop] ? obj1[prop] : undefined) : undefined;
  let obj2final = (obj2) ? (obj2[prop] ? obj2[prop] : undefined) : undefined;
  let final = obj1final || obj2final;
  return final;
}

UserStyle.prototype.deriveUserstyleJSON = function(home, project) {
  let meta = {};

  // get 'name' from current directory name if not given
  const dirs = process.cwd().split(path.sep);
  const projectDir = dirs[dirs.length-1];

  meta.name         = mergeProperty(home, project, 'name')         || projectDir;
  meta.version      = mergeProperty(home, project, 'version')      || '1.0.0';
  meta.description  = mergeProperty(home, project, 'description')  || '';
  meta.author       = mergeProperty(home, project, 'author')       || '';
  meta.namespace    = mergeProperty(home, project, 'namespace')    || 'openusercss.org';
  meta.homepageURL  = mergeProperty(home, project, 'homepageURL')  || '';
  meta.supportURL   = mergeProperty(home, project, 'supportURL')   || '';
  meta.downloadURL  = mergeProperty(home, project, 'downloadURL')  || '';
  meta.updateURL    = mergeProperty(home, project, 'updateURL')    || '';
  meta.license      = mergeProperty(home, project, 'license')      || 'MIT';
  meta.preprocessor = mergeProperty(home, project, 'preprocessor') || '';
  meta.include      = mergeProperty(home, project, 'include')      || [];

  return meta;
}

UserStyle.prototype.writeUserstyleJSON = function() {
  console.log('writeUserstyleJSON(): not yet implemented.');
}

UserStyle.prototype.createUserCSSMetaHeader = function() {
  console.log('createUserCSSHeader(): not yet implemented.');
}

UserStyle.prototype.createUserJSMetaHeader = function() {
  console.log('createUserJSHeader(): not yet implemented.');
}

UserStyle.prototype.writeUserCSS = function() {
  console.log('writeUserCSS(): not yet implemented.');
}

UserStyle.prototype.writeUserJS = function() {
  console.log('writeUserJS(): not yet implemented.');
}

UserStyle.prototype.writeSkeletonUserCSS = function() {
  console.log('writeSkeletonUserCSS(): not yet implemented.');
}

UserStyle.prototype.writeSkeletonUserJS = function() {
  console.log('writeSkeletonUserJS(): not yet implemented.');
}



// https://github.com/openstyles/stylus/wiki/Usercss

// @name
// @version
// @namespace
// @description
// @author
// @homepageURL
// @supportURL
// @license
// @preprocessor
// @var

// https://tampermonkey.net/documentation.php
// @name
// @namespace
// @version
// @author
// @description
// @homepage, @homepageURL, @website and @source
// @icon, @iconURL and @defaulticon
// @icon64 and @icon64URL
// @updateURL
// @downloadURL
// @supportURL
// @include
// @match
// @exclude
// @require
// @resource
// @connect
// @run-at
// @grant
// @noframes
// @unwrap
// @nocompat

// https://sourceforge.net/p/greasemonkey/wiki/Metadata_Block/

// @name
// @run-at
// @require
// @version
// @namespace
// @include
// @resource
// @updateURL
// @description
// @exclude
// @grant
// @installURL (doesn't appear above in Tampermonkey docs)
// @icon
// @match
// @unwrap
// @downloadURL
// @author
// @noframes
// @homepageURL
