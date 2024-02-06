import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { readFile } from 'fs/promises'

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
			const token = await generateAccessToken(req.body.username);
			return res.json({ token: token, userId: user._id });
		}
		return res.status(401).json({ message: "Invalid Credentials" });
	} catch (err) {
		res.status(401).send(err.message);
	}
});

async function generateAccessToken(username) {
	const TOKEN_SECRET = await readFile(process.env.TOKEN_SECRET_FILE)
	return jwt.sign({ name: username }, TOKEN_SECRET, { expiresIn: 60 * 60 * 24 });
}

export { router };
