
const path = require('path');
const fs = require('fs');
const os = require('os');


const USERSTYLE_JSON = 'userstyle.json';

const META_DEFAULT_VERSION = '1.0.0';
const META_DEFAULT_NAMESPACE = 'openusercss.org';
const META_DEFAULT_LICENSE = 'MIT';

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

function getFirstPropValOf(propName, objList, defValue) {
  let final;
  for (let i = 0; i < objList.length; i++) {
    if (objList[i] && propName in objList[i]) {
      final = final || objList[i][propName];
    }
  }
  return final || defValue;
}

UserStyle.prototype.deriveUserstyleJSON = function(home, project) {
  let meta = {};

  // get 'name' from current directory name if not given
  const dirs = process.cwd().split(path.sep);
  const projectDir = dirs[dirs.length-1];

  meta.name         = getFirstPropValOf('name',         [project, home], projectDir            );
  meta.version      = getFirstPropValOf('version',      [project, home], META_DEFAULT_VERSION  );
  meta.description  = getFirstPropValOf('description',  [project, home], ''                    );
  meta.author       = getFirstPropValOf('author',       [project, home], ''                    );
  meta.namespace    = getFirstPropValOf('namespace',    [project, home], META_DEFAULT_NAMESPACE);
  meta.homepageURL  = getFirstPropValOf('homepageURL',  [project, home], ''                    );
  meta.supportURL   = getFirstPropValOf('supportURL',   [project, home], ''                    );
  meta.downloadURL  = getFirstPropValOf('downloadURL',  [project, home], ''                    );
  meta.updateURL    = getFirstPropValOf('updateURL',    [project, home], ''                    );
  meta.license      = getFirstPropValOf('license',      [project, home], META_DEFAULT_LICENSE  );
  meta.preprocessor = getFirstPropValOf('preprocessor', [project, home], ''                    );
  meta.include      = getFirstPropValOf('include',      [project, home], []                    );

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
