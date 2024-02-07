import { Router } from 'express';
import bcrypt from 'bcrypt';

import { getUserByUsername } from '../models/User.js';
import { generateAccessToken } from '../lib/jwtHelper.js';

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
			const token = await generateAccessToken(user);
			return res.json({ token: token });
		}
		return res.status(401).json({ message: "Invalid Credentials" });
	} catch (err) {
		res.status(401).send(err.message);
	}
});

export { router };
