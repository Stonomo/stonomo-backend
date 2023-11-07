import { Router } from 'express';
import bcrypt from 'bcrypt';

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
			// TODO: add session persistence
			return res.status(200).json({ message: "User Logged in Successfully" });
		}
		return res.status(401).json({ message: "Invalid Credentials" });
	} catch (err) {
		res.status(401).send(err.message);
	}
});

export { router };
