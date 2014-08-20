var JSONBase = require('./index.js');

var db = new JSONBase('../tmp', {
	pretty: true
});

var User = db.model('User', {
	active: true,
	createdAt: function() {
		return Date.now();
	},
	updatedAt: function() {
		return Date.now();
	}
});

var user = User.create({
	name: 'John Doe',
	email: 'johndoe@gmail.com'
});

console.log(user);

User.clear();