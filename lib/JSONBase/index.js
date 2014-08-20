var path = require('path');

var JSONFile = require('./../JSONFile');
var JSONModel = require('./../JSONModel');

var JSONBase = function(p, opt) {
	"use strict";

	opt = opt || {};

	p = path.join(process.cwd(), p || "");

	var CONST = {
		PATH: p,
		PRETTY: opt.pretty || false,
		CONFIG: path.join(p, (opt.config || 'database.json')),
		VERBOSE: opt.verbose || false
	};

	var loggerWrapper = function(fn, force) {
		return function() {
			if (CONST.VERBOSE || force) {
				fn.apply(fn, arguments);
			}
		}
	};

	var logger = {
		info: loggerWrapper(console.info),
		debug: loggerWrapper(console.info),
		trace: loggerWrapper(console.info),
		warn: loggerWrapper(console.warn, true),
		error: loggerWrapper(console.error, true)
	};

	logger.info('Initializing database on path: %s', CONST.PATH);
	this.db = new JSONFile(CONST.CONFIG, {
		pretty: CONST.PRETTY
	});

	if (!this.db.raw.models) {
		logger.info('No model found, initializing list...');
		this.db.raw.models = {};
	}

	this.models = Object.keys(this.db.raw.models);

	if (this.models.length) {
		logger.info('%d model%s found in database: %j', this.models.length, this.models.length > 1 ? 's' : '', this.models);
	}

	this.model = function(name, opt, schema) {
		logger.info('Initializing model: %s', name);
		this.db.raw.models[name] = path.join(CONST.PATH, name + '.json');
		this.db.save();

		return new JSONModel(this.db, name, opt);
	}
};

module.exports = JSONBase;