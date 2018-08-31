#userstyle-gen

> WIP: This is a get-something-working release that is just a partially implemented script. It needs to be refactored, modularized, tested, covered, & smothered.

---

## Install

Add to your project with:

```shell
npm install userstyle-gen --save-dev
```

## css2userstyle

Convert CSS to userstyles (user.css) and userscripts (user.js)

```shell
css2userstyle [options] <filename>
```

### Description

This script takes a CSS file as input, along with metadata that describes the style, and produces userstyle (user.css) and userscript (meta.js & user.js) files for distributing themes.

The metadata for the style is supplied from a `userstyle.json` file in the current directory and/or from the `package.json` file. For each known metadata attribute, it looks first in `userstyle.json`, then for a **_"userstyle"_** key in `package.json`, finally at the top level of the `package.json`, taking the first value found in that search order.

**See [userstyle](userstyle.md) to learn more about the metadata json format.**

### Options

- basename <filename>

  Normally, the output filename is derived from the name of the source file. You can change the base part of the filename, excluding the path, by specifying the `--basename` option.

- output <directory>

  Allows specifying the directory path where the output files will be written.
