var _ = require('lodash');
var async = require('async-chainable');
var fs = require('fs');
var fspath = require('path');

module.exports = function(grep, options, callback) {
	// Argument mangling {{{
	if ((_.isString(grep) || _.isArray(grep) || _.isRegExp(grep)) && _.isObject(options) && _.isFunction(callback)) {
		// Perfect call - skip
	} else if ((_.isString(grep) || _.isArray(grep) || _.isRegExp(grep)) && _.isFunction(options)) {
		// Skipped options
		callback = options;
		options = {};
	} else if (_.isObject(grep) && _.isFunction(options)) {
		// Skipped grep
		callback = options;
		options = grep;
		grep = null;
	} else {
		throw new Error('Unknown call method. Invoke as `requireGrep(grep, [options], callback)`');
	}
	// }}}
	// Settings defaults {{{
	var settings = _.defaults(options || {}, {
		callback: callback || _.noop,
		greps: _.castArray(grep) || [],
		failNone: true,
		array: false,
		failOne: false,
		failMultiple: true,
		failDirErr: false,
		failDirStat: false,
		failDirJSON: false,
		local: true,
		global: false,
		globalPaths: process.env.NODE_PATH ? process.env.NODE_PATH.split(/\s*:\s*/) : '',
		localPaths: [fspath.join(__dirname, 'node_modules')],
		multiple: false,
	});
	// }}}
	// Settings shortcuts (multiple) {{{
	if (settings.multiple) {
		settings.array = true;
		settings.failOne = false;
		settings.failMultiple = false;
		settings.failNone = false;
	}
	// }}}

	async()
		// Calculate paths {{{
		.then('paths', function(next) {
			next(null, [].concat(
				settings.local && settings.localPaths ? settings.localPaths.map(function(p) { return fspath.resolve(p) }) : [],
				settings.global && settings.globalPaths ? settings.globalPaths.map(function(p) { return fspath.resolve(p) }) : []
			));
		})
		// }}}
		// Step 1 - search all paths and prepare a candidate list {{{
		.set('candidates', [])
		.forEach('paths', function(next, path) {
			var self = this;
			fs.readdir(path, function(err, files) {
				if (err) return settings.failDirErr ? next(err) : next(); // Silently ignore dir errors if !! failDirErr
				files.forEach(function(file) {
					if (
						!settings.greps || !settings.greps.length || // Return all
						settings.greps.some(function(grep) { // Grep by expressions
							return (
								(_.isRegExp(grep) && grep.test(file)) ||
								(_.isString(grep) && file == grep) ||
								(_.isFunction(grep) && grep(file))
							);
						})
					)
						self.candidates.push(fspath.join(path, file));
				});

				next();
			});
		})
		// }}}
		// Step 2 - scan candidates and make sure they are a valid NodeJS module {{{
		.set('modules', [])
		.forEach('candidates', function(next, path) {
			var self = this;
			async()
				.then('stat', function(next) {
					fs.stat(path, function(err, stat) {
						if (err) return settings.failDirStat ? next(err) : next(); // Silently ignore dir errors if !! failDirStat
						next(null, stat);
					});
				})
				.then(function(next) {
					if (!this.stat.isDirectory()) return next(); // Ignore non-directories
					fs.stat(fspath.join(path, 'package.json'), function(err, jsonStat) {
						if (err) return settings.failDirJSON ? next(err) : next(); // Silently ignore JSON + package errors if !! failDirJSON
						next();
					});
				})
				.then(function(next) {
					// If we got to this stage then all is well
					self.modules.push(path);
					next();
				})
				.end(next);
		})
		// }}}
		// End {{{
		.end(function(err) {
			if (err) return settings.callback(err);
			if (settings.failNone && !this.modules.length) return settings.callback('No modules found');
			if (settings.failOne && this.modules.length == 1) return settings.callback('Only one module found');
			if (settings.failMultiple && this.modules.length > 1) return settings.callback('Multiple modules found');
			if (settings.array) return settings.callback(err, this.modules);
			settings.callback(null, this.modules[0]);
		});
		// }}}
};
