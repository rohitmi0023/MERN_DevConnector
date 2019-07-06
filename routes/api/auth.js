const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../../models/User');
const auth = require('../../middleware/auth');

const router = express.Router();

//@route GET api/auth
//@desc  Auth route
//@access Public
router.get('/', auth, async (req, res) => {
	try {
		//To connect to our database
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (err) {
		console.log(err.message);
		res.status(500).send(`Server Error`);
	}
});

//@route POST api/auth
//@desc  LogIn route || Authenticate User and get token
//@access Public
router.post(
	'/',
	[
		check('email', `Please include a valid Email`).isEmail(),
		check('password', `Password is required!`).exists()
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { email, password } = req.body;
		try {
			let user = await User.findOne({ email }); //GET THE USER
			if (!user) {
				return res
					.status(400)
					.json({ errors: [{ msg: `Invalid Credentials1` }] });
			}
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return res
					.status(400)
					.json({ errors: [{ msg: `Invalid Credentials` }] });
			}
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
