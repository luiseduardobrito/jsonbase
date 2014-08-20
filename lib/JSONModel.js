var path = require('path');

var JSONFile = require('./JSONFile');

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
		this.json.raw.data = this.json.raw.data || [];
		this.json.raw._m = this.name;
		this.json.raw._s = this.toObject();
		this.json.save();
	};

	this.toObject = function() {
		var obj = {};
		for (var k in this.schema) {
			if (typeof this.schema[k] === typeof CONST.NOOP) {
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
		while(this.json.raw.data.length > 0) {
			this.json.raw.data.pop();
		}
		this.json.save();
	};

	this.init();
};

module.exports = JSONModel;