var should = require('should');

var DATA = {
	PRETTY: true,
	VALID: {
		name: 'John Doe',
		email: 'johndoe@gmail.com'
	},
	SCHEMA: {
		active: true,
		greet: function() {
			return 'Hello, ' + this.name
		},
		createdAt: function() {
			return Date.now();
		},
		updatedAt: function() {
			return Date.now();
		}
	},
	MODEL: 'UserTest'
};

describe('lib', function() {
	"use strict";

	var JSONBase = require('./index.js');

	it('should create a valid database', function() {
		(new JSONBase('../tmp', {
			pretty: DATA.PRETTY,
		})).should.be.ok;
	});

	describe('model', function() {

		var db = null;

		beforeEach(function() {

			db = new JSONBase('../tmp', {
				pretty: DATA.PRETTY
			});

			db.should.be.ok;
		});

		it('should create a valid model in the database and store its schema', function() {

			var UserTest = db.model(DATA.MODEL, DATA.SCHEMA);
			UserTest.toObject().should.be.ok;

			var UserTestWithoutSchema = db.model(DATA.MODEL);
			UserTestWithoutSchema.toObject().should.be.ok;

			UserTest.toObject().should.eql(UserTestWithoutSchema.toObject());
			UserTest.toObject(true).should.eql(UserTestWithoutSchema.toObject(true));
		});

		it('should create a valid model instance and save it in database', function() {

			var UserTest = db.model(DATA.MODEL, DATA.SCHEMA);
			UserTest.toObject().should.be.ok;

			var user = UserTest.create(DATA.VALID);
			user.should.be.ok;

			user.name.should.be.ok;
			user.email.should.be.ok;
			user.active.should.be.true;

			user.greet.should.be.equal('Hello, ' + DATA.VALID.name);
			//UserTest.clear();
		});
	});

	//var user = User.create({
	//	name: 'John Doe',
	//	email: 'johndoe@gmail.com'
	//});

	//console.log(user);

	//User.clear();

});