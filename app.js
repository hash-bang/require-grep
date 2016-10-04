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
	.option('-j, --json', 'Output JSON data')
	.option('-v, --verbose', 'Be verbose')
	.parse(process.argv);

async()
	.use(require('async-chainable-flush'))
	.set('searches', {})
	// Search for each given module {{{
	.forEach(program.args, function(next, arg) {
		var task = this;
		if (program.verbose) console.log('Search for', arg);
		requireGrep(program.args, options, function(err, res) {
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
