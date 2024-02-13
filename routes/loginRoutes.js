import { Router } from 'express';
import bcrypt from 'bcrypt';

import { getUserByUsername } from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../lib/jwtHelper.js';

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
			const authToken = await generateAccessToken(user);
			const refreshToken = await generateRefreshToken(user);

			res.cookie('stonomoToken', authToken, {
				secure: process.env.NODE_ENV !== "development",
				httpOnly: true,
				signed: true,
				sameSite: "strict",
				maxAge: 1000 * 60 * 60
			});

			return res.json(refreshToken);
		}
		return res.status(401).json({ message: "Invalid Credentials" });
	} catch (err) {
		res.status(401).send(err.message);
	}
});

export { router };
