require-grep
============
Minimal NodeJS module finder with grepping capabilities.

In its simplest invocation this will return a list of paths (`require()` ready) that match the string, regexp or filter expression given.

```javascript
var requireGrep = require('require-grep');

// Find the globally installed version of lodash
requireGrep('lodash', function(err, path) {
	// Path will be something like "/usr/lib/node_modules/lodash"
});

// Find all globally installed lodash plugins
requireGrep(^lodash-/, {multiple: true}, function(err, paths) {
	// Paths will be an array of found global module directories
});
```


Why
---
There are already quite a selection of modules that can find modules. But they have a variety of weird bugs, are unmaintained or rely on far too many weird-and-wonderful dependencies in order to do what is a relatively simple task - finding a module.

This module is intended to be as brain-dead as possible - doing only one single thing - returning a list of modules matching a grep.


Options
=======

| Option         | Default                 | Description                                                                                                           |
|----------------|-------------------------|-----------------------------------------------------------------------------------------------------------------------|
| `callback`     | the last argument       | The callback to invoke with `(err, foundPath)` parameters                                                             |
| `greps`        | the first argument      | An array of grep expressions to search by. These can be strings, regExps or functions                                 |
| `local`        | `true`                  | Search the local directory for modules                                                                                |
| `global`       | `false`                 | Search all global paths for modules                                                                                   |
| `globalPaths`  | `process.env.NODE_PATH` | The global paths to search                                                                                            |
| `localPaths`   | `./node_modules`        | The local paths to search                                                                                             |
| `multiple`     | `false`                 | Shortcut property to set `{failNone: false, failOne: false, failMultiple: false, array: true}` |
| `failNone`     | `true`                  | Return an error if no modules were found                                                                              |
| `failOne`      | `false`                 | Return an error if only one module was found                                                                          |
| `failMultiple` | `true`                  | Return an error if multiple modules were found                                                                        |
| `failDirErr`   | `false`                 | Return an error if any of the module search paths raise an error. False will fail silently (recommended)              |
| `failDirStat`  | `false`                 | Return an error if any of the module search paths fail to stat. False will fail silently (recommended)                |
| `failDirJSON`  | `false`                 | Return an error if any of the candidate modules do not have a valid JSON file. False will fail silently (recommended) |
