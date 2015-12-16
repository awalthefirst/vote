require('dotenv').config({silent: true});
var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var userSchema = new Schema({
	username: {
		type: String,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	email: {
		type: String,
		unique: true,
		required: true
	},
	votes:{
		type:Array,
		unique:false,
		required:false
	}
});




var User = mongoose.model('register', userSchema);
var dbuser = process.env.dbUser;
var dbpassword = process.env.dbPass;
//mongo
mongoose.connect('mongodb://'+ dbuser +':' + dbpassword +'@ds061954.mongolab.com:61954/votebookdb');
module.exports = User;