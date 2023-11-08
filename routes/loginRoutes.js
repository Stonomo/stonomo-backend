import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

import { getUserByUsername } from '../models/User.js';

var router = Router();

/* POST login. */
router.post('/login', async (req, res) => {
	try {

		let user = await getUserByUsername(req.body.username);

		if (!user) {
			return res.status(401).json({ message: "Invalid Credentials" });
		}

		// Compare passwords
		const result = await bcrypt.compare(req.body.password, user.passHash);
		if (result) {
			const token = generateAccessToken(req.body.username);
			return res.json(token);
		}
		return res.status(401).json({ message: "Invalid Credentials" });
	} catch (err) {
		res.status(401).send(err.message);
	}
});

function generateAccessToken(username) {
	//process.env.TOKEN_SECRET contains private key
	return jwt.sign({ name: username }, process.env.TOKEN_SECRET, { expiresIn: 60 * 60 });
}

export { router };
