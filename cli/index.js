#!/usr/bin/env node

/**
 * CLI dependencies.
 */
var program = require('commander');
var path = require('path');
var pkg = require('../package.json');

/**
 * JSON Base Lib
 */
var JSONBase = require('../lib');

/**
 * CLI Program
 */
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
			console.log('    $ jsonbase list				List available models');
			console.log('    $ jsonbase list <model>		List all model instances');
			console.log('    $ jsonbase create <model> [schema]		Create new model based on specified schema, if any');
			console.log('    $ jsonbase insert <model> <item>		Insert new item in model data list');
			console.log('    $ jsonbase query <model> <condition>	Query model for specified condition');
			console.log('');
			console.log('');
			console.log('  Examples:');
			console.log('');
			console.log('');
			console.log('    $ jsonbase create User "{active: true, createdAt: function(){return Date.now()}}"');
			console.log('    $ jsonbase list User ');
			console.log('    $ jsonbase insert User "{name: \'John Doe\', email: \'johndoe@gmail.com\'}"');
			console.log('    $ jsonbase query User "this.email === \'johndoe@gmail.com\' && this.active === true"');
			console.log('');
		})

		.parse(process.argv);

/**
 * CLI Constants
 */
var CONST = {
	PATH: program.dir || '.jsonbase',
	PRETTY: !!program.pretty,
	TABS: program.tabs || 2,
	VERBOSE: program.verbose || false
};

var Logger = function(verbose) {

	// Wrapper info messages in verbose mode
	var wrapper = function(fn, force) {
		return function() {
			if (verbose || force) {
				fn.apply(fn, arguments);
			}
		}
	};

	// Public Interface
	return {

		// Only verbose
		info: wrapper(console.info),
		debug: wrapper(console.info),
		trace: wrapper(console.info),

		// Error logs
		warn: wrapper(console.warn, true),
		error: wrapper(console.error, true),

		// Results
		result: wrapper(console.info, true)
	};
};

var logger = new Logger(CONST.VERBOSE);

// Initializing database
var db = new JSONBase(CONST.PATH, {
	pretty: CONST.PRETTY,
	tabs: CONST.tabs,
	verbose: CONST.VERBOSE
});

if (program.args[0] === 'create') {

	var name = program.args[1];
	var schema = "" + (program.args[2] || "");

	if (schema && schema.length) {
		schema = (new Function('return ' + schema)).apply();
	}

	logger.info('Creating new model%s...', Object.keys(schema).length ? ' with schema' : '');
	db.model(name, schema);
	logger.info('"%s" model created successfully', name);
}

else if (program.args[0] === 'list') {

	var model = program.args[1];

	if (model && model != 'models') {

		logger.info('Initializing "%s" model', model);
		var Model = db.model(model);

		logger.info('Listing all "%s" instances', model);

		var results = null;

		try {
			var query = Model.Query();
			results = query.Where(function(item) {
				return true;
			});
		}
		catch (e) {
			logger.error('Error querying "%s" model', model, condition);
			logger.error(e);
		}

		logger.result(results && results.items ? results.items : []);

	}
	else {
		logger.result(db.models);
	}
}

else if (program.args[0] === 'insert') {

	var name = program.args[1];
	var data = "" + (program.args[2] || "");

	if (data && data.length) {
		data = (new Function('return ' + data)).apply();
	}

	var i = db.model(name).create(data);
	logger.info('Item inserted successfully', name);
	logger.result(i);
}

else if (program.args[0] === 'query') {
	var model = program.args[1];
	var condition = program.args[2] || "true";

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

	logger.result(results && results.items ? results.items : []);
}