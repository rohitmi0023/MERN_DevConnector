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
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { name, email, password } = req.body;
		try {
			let user = await User.findOne({ email }); //GET THE USER
			if (user) {
				//See if user already exists
				return res
					.status(400)
					.json({ errors: [{ msg: `User already exists!` }] });
			}
			// //Get users gravatar
			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm'
			});
			user = new User({
				//Create the user
				name,
				email,
				avatar,
				password
			});
			//Encrypt password
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt); //Hash the password
			await user.save(); //Save the user in database
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
			console.log(err.message);
			res.send(500).send(`Server Error...`);
		}
	}
);

module.exports = router;
