import { Router } from 'express';
import bcrypt from 'bcrypt';

import { getUserByUsername } from '../models/User.js';

var router = Router();

/* POST login. */
router.post('/login', async (req, res) => {
	try {

		let user = await getUserByUsername(req.body.username);

		if (!user) {
			res.status(401).json({ message: "Invalid Credentials" });
		}

		// Compare passwords
		bcrypt.compare(req.body.password, user.passHash, (err, result) => {
			if (result) {
				return res.status(200).json({ message: "User Logged in Successfully" });
			}
			else {
				return res.status(401).json({ message: "Invalid Credentials" });
			}
		});
	} catch (err) {
		res.status(401).send(err.message);
	}
});

export { router };
