const express = require('express');
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User');

const router = express.Router();

//@route POST api/users
//@desc  Register route
//@access Public
router.post(
	//Post is used to add new data in Non-Idempotent request (URL changes), put is used to update data in Idempotent request(URL remains same)
	'/',
	[
		check('name', `Name is required!`)
			.not()
			.isEmpty(),
		check('email', `Please include a valid Email`).isEmail(),
		check(
			'password',
			`Please enter a password with 6 or more characters!`
		).isLength({ min: 6 })
	],
	async (req, res) => {
		const errors = validationResult(req); //To handle the response of express validator, returns a Result Object
		const hasErrors = !errors.isEmpty(); //.isEmpty() returns a boolean indicating whether this result object contains no errors at all.
		if (hasErrors) {
			return res.status(400).json({ errors: errors.array() }); //.array returns an ARRAY of validation errors, an object within it called errors which will give other objects
		}
		const { name, email, password } = req.body; //Destructuring to directly get name without typing req.body.name, etc
		//To make req.body work, we have to initialize the middlwware for the body-parser
		try {
			let user = await User.findOne({ email }); //GET THE USER
			//above one can be witten as let user = await User.findOne({ email: req.body.email })
			if (user) {
				//See if user already exists
				return res
					.status(400)
					.json({ errors: [{ msg: `User already exists!` }] }); //returns an object with an errors array
			}
			// //Get users gravatar
			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm'
			});
			user = new User({
				//Creating an instancr of user
				//Create the user
				name,
				email,
				avatar,
				password
			});
			//Encrypt password
			const salt = await bcrypt.genSalt(10); //Creating a salt to do hashing
			user.password = await bcrypt.hash(password, salt); //Hash the password
			await user.save(); //Save the user in database, gives us a promise
			const payload = {
				//Get the payload which has user id
				user: {
					id: user.id
				}
			};
			jwt.sign(
				//Signin the token
				payload, //Pass in the payload
				config.get('jwtSecret'), //Pass in the secret
				{ expiresIn: 360000 },
				(err, token) => {
					if (err) throw err;
					res.json({ token }); //Sending the token back to the client
				}
			);
		} catch (err) {
			console.error(err.message);
			res.send(500).send(`Server Error...`);
		}
	}
);

module.exports = router;
