var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var pollSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique:false
	},
	pollName: {
		type: String,
		required: true,
		unique:true
	},
	polls: {
		type: Object,
		required: true
	}
});

var polls = mongoose.model('polls', pollSchema);
//mongo
module.exports = polls;
