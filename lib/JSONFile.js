var fs = require('fs');

var logger = console;
logger.trace = logger.info;

var JSONFile = function(path, opt) {
	"use strict";

	opt = opt || {};

	var CONST = {
		NOOP: function() {
		},
		PRETTY: opt.pretty || false,
		TABS: opt.tabs || 2,
		ASYNC: opt.async || false
	};

	this.path = path;
	this.raw = {};

	this.upgrade = function() {
		this.raw._v = Date.now();
		logger.info('_v: ' + this.raw._v);
	};

	this.toJSON = function() {
		if(CONST.PRETTY) {
			return JSON.stringify(this.raw, null, CONST.TABS);
		}
		else {
			return JSON.stringify(this.raw);
		}
	};

	this.save = function(fn) {

		this.upgrade();

		if (fn || typeof fn === typeof CONST.NOOP) {
			logger.info('Saving file ' + this.path);
			fs.writeFile(this.path, this.toJSON(), fn);
		}

		else if (CONST.ASYNC) {
			logger.info('Saving file ' + this.path + ' asynchronously');
			fs.writeFileSync(this.path, this.toJSON());
		}

		else {
			logger.info('Saving file ' + this.path);
			fs.writeFile(this.path, this.toJSON(), fn);
		}
	};

	this.init = function() {
		logger.trace('Initializing file ' + this.path);
		this.save();
	};

	try {
		this.raw = require(path);
	}

	catch (e) {
		logger.warn('File not found, initializing...');
	}

	this.init();
};

module.exports = JSONFile;