var fs = require('fs');

var NOOP = function() {
};

var JSONFile = function(path, opt) {
	"use strict";

	opt = opt || {};

	var CONST = {
		NOOP: function() {
		},
		PRETTY: opt.pretty || false,
		TABS: opt.tabs || 2,
		ASYNC: opt.async || false,
		VERBOSE: opt.verbose || false
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


	this.path = path;
	this.pretty = CONST.PRETTY;
	this.raw = {};

	this.upgrade = function() {
		this.raw._v = Date.now();
		logger.info('_v: ' + this.raw._v);
	};

	this.toJSON = function() {
		if (CONST.PRETTY) {
			return JSON.stringify(this.raw, null, CONST.TABS);
		}
		else {
			return JSON.stringify(this.raw);
		}
	};

	this.save = function(fn) {

		this.upgrade();

		var dir = require('path').dirname(this.path);

		if (!fs.existsSync(dir)) {
			logger.info('Creating directory structure recursively for JSONFile');
			fs.mkdirSync(dir, '0777', true);
		}

		// TODO: implement locks for async queue save
		if (fn || typeof fn === typeof CONST.NOOP) {
			logger.info('Saving file ' + this.path + ' asynchronously');
			fs.writeFile(this.path, this.toJSON(), fn);
		}

		else if (!CONST.ASYNC) {
			logger.info('Saving file ' + this.path);
			fs.writeFileSync(this.path, this.toJSON());
		}
	};

	this.init = function() {
		logger.trace('Initializing file %s', this.path);
		this.save();
	};

	try {
		this.raw = require(path);
	}

	catch (e) {
		logger.warn('%s: file not found, initializing...', require('path').basename(this.path));
	}

	this.init();
};

module.exports = JSONFile;