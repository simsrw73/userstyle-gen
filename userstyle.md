# userstyle metadata

This json format closely follows the [UserCSS format](https://github.com/openstyles/stylus/wiki/Usercss#usercss-metadata).

### name [string] (**required**)

The name of the style.

### version [string] (**required**)

The version of the release, using [Semantic Version](https://semver.org/) format.

### namespace [string] (**required**)

Used to distinguish between styles with the same name. Usually author's nickname or homepage.

### description [string]

A short description of the style.

### author [string | object]

The name of the author, optionally followed by an email address and/or homepage url. This can either be a string of the format:

```
{
  "name": "John Doe <jdoe@gmail.com> (http://website.com/jdoe/)"
}
```

or an object key:

```
{
  "name": "John Doe",
  "email": "jdoe@gmail.com",
  "url": "http://website.com/jdoe/"
}
```

### homepageURL [string]

URL of the homepage for the theme.

### supportURL [string]

URL to the issue tracker for the theme.

### updateURL [string]

URL _path_ where the theme can be automatically updated. This is the path without the filename. The filename will be derived from the name of the output file during conversion. For userstyles, it will be the base filename with an added '.user.css' extension. For userscripts, it will be the base filename with an added '.meta.js' or '.user.js' extension.

### license [string]

The name of the license. Eg. MIT

### preprocessor

This is defined in the UserCSS spec, but not used here as it is assumed the file is preprocessed during the build, before the conversion.

### match [object]

This is a list of rules that determine what website urls to apply the style to. For usercss, it is converted to [@-moz-document rules](https://github.com/stylish-userstyles/stylish/wiki/Valid-@-moz-document-rules). For userjs, it is converted to [#include rules](https://tampermonkey.net/documentation.php#_include).

Currently, we support the following:

- domain [string | array]

  Domain rules should just be the domain name, without protocol, port, or wildcards. A domain rule will affect all pages on that domain and all of its subdomains.

- url [string | array]

  URL rules should contain a URL you want to affect, including protocol. Wildcards are not permitted.

- url-prefix [string | array]

  URL prefix rules should contain the start of URLs you want to affect, including protocol. Wildcards are not permitted.

  Each of the keys can either be a single string or an array of strings.

  ```json
  {
    "match": {
      "domain": "somewhere.com",
      "url-prefix": [
        "http://someplace.com/support",
        "http://someplace.com/faqs"
      ]
    }
  }
  ```

  This will produce the following usercss & userjs

  ```
  @-moz-document
    domain('somewhere.com'),
    url-prefix('http://someplace.com/support'),
    url-prefix('http://someplace.com/faqs')
  {...}
  ```

  ```
  // @include       http://somewhere.com/*
  // @include       https://somewhere.com/*
  // @include       http://*.somewhere.com/*
  // @include       https://*.somewhere.com/*
  // @include       http://someplace.com/support/*
  // @include       http://someplace.com/faqs/*
  ```

## See Also

- UserStyle

  <https://github.com/openstyles/stylus/wiki/Usercss>

- Tampermonkey

  <https://tampermonkey.net/documentation.php>

- Greasemonkey

  <https://sourceforge.net/p/greasemonkey/wiki/Metadata_Block>
