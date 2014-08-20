var path = require('path');

var JSONFile = require('./../JSONFile');
var JSONModel = require('./../JSONModel');

var JSONBase = function(p, opt) {
	"use strict";

	opt = opt || {};

	p = path.join(path.join(__dirname, '../'), p || "");

	var CONST = {
		PATH: p,
		PRETTY: opt.pretty || false,
		CONFIG: path.join(p,  (opt.config || 'database.json'))
	};

	this.db = new JSONFile(CONST.CONFIG, {
		pretty: CONST.PRETTY
	});

	this.model = function(name, opt, schema) {

		this.db.raw.models = this.db.raw.models || {};
		this.db.raw.models[name] = path.join(CONST.PATH, name + '.json');
		this.db.save();

		return new JSONModel(this.db, name, opt);
	}
};

module.exports = JSONBase;