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
		.usage('[options] <command>')

		.option('-d, --dir <filepath>', 'Set database root directory')
		.option('-p, --pretty', 'Pretty print json files')
		.option('-t, --tabs <n>', 'Pretty print tabs size', parseInt)
		.option('-v, --verbose', 'Full log messages in standard output')

		.on('--help', function() {
			console.log('  Commands:');
			console.log('');
			console.log('    $ jsonbase init				Initialize database in current path or specified path');
			console.log('    $ jsonbase query <model> <condition>	Query model for specified condition');
			console.log('    $ jsonbase create <model> [schema]		Create new model based on specified schema, if any');
			console.log('');
			console.log('  Examples:');
			console.log('    $ jsonbase model User "{active: true, createdAt: function(){return Date.now()}}"');
			console.log('    $ jsonbase query User "this.email === \'johndoe@gmail.com\' && this.active === true"');
			console.log('');
		})

		.parse(process.argv);

var CONST = {
	PATH: program.dir || '_jsonbase',
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

if (program.args[0] === 'model') {

	var name = program.args[1];
	var schema = "" + (program.args[2] || "");

	if(schema && schema.length) {
		schema = (new Function('return ' + schema)).apply();
	}

	logger.info('Creating new model%s...', Object.keys(schema).length ? ' with schema' : '');
	db.model(name, schema);
	logger.info('"%s" model created successfully', name);
}

else if (program.args[0] === 'query') {
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
	}
	catch (e) {
		logger.error('Error querying "%s" model', model, condition);
		logger.error(e);
	}

	logger.result(results.items);
}