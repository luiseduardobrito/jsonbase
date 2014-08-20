var JSONBase = require('./index.js');

var db = new JSONBase('../tmp', {
	pretty: true
});

var UserSchema = {
	active: true,
	createdAt: function() {
		return Date.now();
	},
	updatedAt: function() {
		return Date.now();
	}
};

var User = db.model('User', UserSchema);

var user = User.create({
	name: 'John Doe',
	email: 'johndoe@gmail.com'
});

console.log(user);

//User.clear();