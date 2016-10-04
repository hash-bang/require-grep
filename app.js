#!/usr/bin/env node

var _ = require('lodash');
var async = require('async-chainable');
var program = require('commander');
var requireGrep = require('./index');
var options = {
	multiple: true,
	local: false,
	global: true,
};

program
	.version(require('./package.json').version)
	.usage('[module...]')
	.option('-l, --local', 'Enable searching locally')
	.option('-L, --local-only', 'Search local only (implies `-l --no-global`)')
	.option('-j, --json', 'Output JSON data')
	.option('-r, --regexp', 'Interpret program arguments as regular expressions instead of strings')
	.option('-v, --verbose', 'Be verbose')
	.option('--no-global', 'Disable searching globally')
	.parse(process.argv);

if (program.global === false || program.localOnly) options.global = false;
if (program.local || program.localOnly) options.local = true;

async()
	.use(require('async-chainable-flush'))
	.set('searches', {})
	// Search for each given module {{{
	.forEach(program.args, function(next, arg) {
		var task = this;
		if (program.verbose) console.log('Search for', arg);
		requireGrep(program.regexp ? new RegExp(arg) : arg, options, function(err, res) {
			if (err) return next(err);
			if (!options.json && options.multiple && res.length == 1) {
				task.searches[arg] = res[0]; // Auto flatten results if only one
			} else {
				task.searches[arg] = res;
			}
			next();
		});
	})
	// }}}
	// Output results {{{
	.then(function(next) {
		if (program.json) {
			console.log(this.searches);
		} else {
			_.forEach(this.searches, function(found, search) {
				console.log(search + ':', found);
			});
		}
		next();
	})
	// }}}
	// End {{{
	.flush()
	.end(function(err) {
		if (err) {
			console.log('ERROR', err.toString());
			process.exit(1);
		} else {
			process.exit(0);
		}
	});
	// }}}
