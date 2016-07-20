var expect = require('chai').expect;
var requireGrep = require('..');

describe('require-grep - resolve local modules', function() {
	it('should find all global modules', function(finish) {
		requireGrep({
			global: true,
			local: false,
			array: true,
			failNone: false,
			failOne: false,
			failMultiple: false
		}, function(err, paths) {
			expect(err).to.be.not.ok;
			expect(paths).to.be.an.array;
			finish();
		});
	});

	it('should resolve lodash (globally)', function(finish) {
		requireGrep('lodash', {
			global: true,
			local: false,
		}, function(err, path) {
			expect(err).to.be.not.ok;
			expect(path).to.be.a.string;
			finish();
		});
	});

	it('should resolve mutiple lodash plugins (globally)', function(finish) {
		requireGrep('lodash', {
			global: true,
			local: false,
			multiple: true,
		}, function(err, paths) {
			expect(err).to.be.not.ok;
			expect(paths).to.be.an.array;
			expect(paths).to.have.length.of.at.least(1);
			finish();
		});
	});

	it('should resolve mocha (locally)', function(finish) {
		requireGrep('mocha', {
			global: false,
			local: true,
		}, function(err, path) {
			expect(err).to.be.not.ok;
			expect(path).to.be.a.string;
			finish();
		});
	});

	it('should resolve mocha or chai', function(finish) {
		requireGrep(/^mocha|chai$/, {
			global: false,
			local: true,
			multiple: true,
		}, function(err, paths) {
			expect(err).to.be.not.ok;
			expect(paths).to.be.an.array;
			expect(paths).to.have.length.of.at.least(2);
			finish();
		});
	});

	it('should resolve mocha, chai and lodash using mixed grep methods', function(finish) {
		requireGrep([
			'mocha',
			/hai$/,
			function(p) { return p == 'lodash' },
		], {
			global: false,
			local: true,
			multiple: true,
		}, function(err, paths) {
			expect(err).to.be.not.ok;
			expect(paths).to.be.an.array;
			expect(paths).to.have.length.of.at.least(3);
			finish();
		});
	});
});
