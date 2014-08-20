var path = require('path');

var JSONFile = require('./../JSONFile/index');

var JSONModel = function(db, name, schema) {
	"use strict";

	var CONST = {
		NOOP: function() {
		},
		PATH: path.join(path.dirname(db.path), name + '.json'),
		PRETTY: db.pretty || false
	};

	this.db = db;
	this.name = name;
	this.schema = schema;

	this.json = new JSONFile(CONST.PATH, {
		pretty: CONST.PRETTY
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
			if (raw && typeof this.schema[k] === typeof CONST.NOOP) {
				obj[k] = {
					_f: this.schema[k].toString().match(/function[^{]+\{([\s\S]*)\}$/)[1].replace(/\t/g, '').replace(/\n/g, '')
				}
			}
			else if (typeof this.schema[k] === typeof CONST.NOOP) {
				obj[k] = this.schema[k].call(this.json.raw);
			}
			else {
				obj[k] = this.schema[k];
			}
		}
		return obj;
	};

	this.create = function(input) {

		var model = {};
		var schemaObject = this.toObject();

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

	this.clear = function() {
		while (this.json.raw.data.length > 0) {
			this.json.raw.data.pop();
		}
		this.json.save();
	};

	this.init();
};

module.exports = JSONModel;