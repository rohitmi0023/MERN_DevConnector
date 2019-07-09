const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true,
			unique: true
		},
		password: {
			type: String,
			required: true
		},
		avatar: {
			type: String
		},
		date: {
			type: Date,
			default: Date.now
		}
	},
	{ timestamps: true }
); //The {timestamps: true} option creates a createdAt and updatedAt field on our models that
// contain timestamps which will get automatically updated when our model changes.

module.exports = User = mongoose.model('user', UserSchema); //It registers our schema with mongoose. Our user
//model can then be accessed anywhere in our application by calling mongoose.model('User').
