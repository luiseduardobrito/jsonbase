#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var pkg = require('../package.json');

program
		.version('0.0.1')
		.option('-p, --pretty', 'Pretty print json files')
		.option('-t, --tabs <n>', 'Pretty print tabs size', parseInt)
		.option('-v, --verbose', 'Full log messages in standard output')
		.parse(process.argv);