var path = require('path');

var LINQ = require('../LINQ').LINQ;
var JSONFile = require('./../JSONFile/index');

var JSONModel = function(db, name, schema, opt) {
	"use strict";

	opt = opt || {};

	var CONST = {
		NOOP: function() {
		},
		PATH: path.join(path.dirname(db.path), name + '.json'),
		PRETTY: db.pretty || false,
		TABS: opt.tabs || 2,
		VERBOSE: opt.verbose || false
	};

	this.db = db;
	this.name = name;
	this.schema = schema;

	this.json = new JSONFile(CONST.PATH, {
		pretty: CONST.PRETTY,
		tabs: CONST.TABS,
		verbose: CONST.VERBOSE
	});

	this.init = function() {

		this.schema = this.schema || this.fromObject(this.json.raw._s)

		this.json.raw.data = this.json.raw.data || [];
		this.json.raw._m = this.name;

		this.json.raw._s = this.toObject(true);
		this.json.save();
	};

	this.fromObject = function(obj) {
		for (var k in obj) {
			if (obj[k]._f) {
				obj[k] = new Function(obj[k]._f);
			}
		}

		return obj;
	};

	this.toObject = function(raw) {

		var obj = {};

		for (var k in this.schema) {

			if (raw === true && typeof this.schema[k] === typeof CONST.NOOP) {

				var str = this.schema[k].toString();
				var body = str.match(/function[^{]+\{([\s\S]*)\}$/)[1];
				var cleanBody = body.replace(/\t/g, '').replace(/\n/g, '');

				obj[k] = {
					_f: cleanBody
				}
			}

			else if (raw && typeof this.schema[k] === typeof CONST.NOOP) {
				obj[k] = this.schema[k].call(raw);
			}

			else if (typeof this.schema[k] === typeof CONST.NOOP) {
				obj[k] = this.schema[k].apply(raw);
			}

			else {
				obj[k] = this.schema[k];
			}
		}
		return obj;
	};

	this.create = function(input) {

		var model = {};
		var schemaObject = this.toObject(input);

		for (var k in schemaObject) {
			model[k] = schemaObject[k];
		}

		for (var k in input) {
			model[k] = input[k];
		}

		this.json.raw.data.push(model);
		this.json.save();
		return model;
	};

	this.Query = function() {
		return new LINQ(this.json.raw.data || []);
	};

	this.clear = function() {
		while (this.json.raw.data.length > 0) {
			this.json.raw.data.pop();
		}
		this.json.save();
	};

	this.init();
};

module.exports = JSONModel;