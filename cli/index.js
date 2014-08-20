#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var path = require('path');
var pkg = require('../package.json');

var JSONBase = require('../lib');

program
		.version(pkg.version)
		.usage('[options] <command ...>')
		.option('-d, --dir <path>', 'Set database root directory')
		.option('-p, --pretty', 'Pretty print json files')
		.option('-t, --tabs <n>', 'Pretty print tabs size', parseInt)
		.option('-v, --verbose', 'Full log messages in standard output')
		.parse(process.argv);

var CONST = {
	PATH: path.join('../', program.dir || 'db'),
	PRETTY: !!program.pretty,
	TABS: program.tabs || 2,
	VERBOSE: program.verbose || false
};

// Wrapper info messages in verbose mode
var loggerWrapper = function(fn, force) {
	return function() {
		if (CONST.VERBOSE || force) {
			fn.apply(fn, arguments);
		}
	}
};

// Prepare logger
var logger = {

	// Only verbose
	info: loggerWrapper(console.info),
	debug: loggerWrapper(console.info),
	trace: loggerWrapper(console.info),

	// Error logs
	warn: loggerWrapper(console.warn, true),
	error: loggerWrapper(console.error, true),

	// Results
	result: loggerWrapper(console.info, true)
};

// Initializing database
var db = new JSONBase(CONST.PATH, {
	pretty: CONST.PRETTY,
	tabs: CONST.tabs,
	verbose: CONST.VERBOSE
});

if (program.args[0] === 'query') {

	var model = program.args[1];
	var condition = program.args[2];

	logger.info('Initializing "%s" model', model);
	var Model = db.model(model);

	logger.info('Finding "%s" instances where "%s"', model, condition);

	var results = null;

	try {
		var query = Model.Query();
		results = query.Where(function(item) {
			return (new Function('return ' + condition)).apply(item)
		});
	} catch(e) {
		logger.error('Error querying "%s" model', model, condition);
		logger.error(e);
	}

	logger.result(results.items);
}