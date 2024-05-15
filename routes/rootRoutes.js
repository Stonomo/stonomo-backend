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
		if (!result) {
			return res.status(401).json({ message: "Invalid Credentials" });
		}

		const tokenFamily = generateNonce();
		const nonce = generateNonce();

		const authToken = await generateAccessToken(user, tokenFamily, nonce);
		const refreshToken = await generateRefreshToken(user, tokenFamily, nonce);

		res.json({ refreshToken, authToken });
	} catch (err) {
		res.status(401).send(err.message);
	}
});

export { router };
