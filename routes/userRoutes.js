import { Router } from 'express';
import { User, getUserById, getUserByUsername, updateUser } from '../models/User.js';
import bcrypt from 'bcrypt';

var router = Router();
const saltRounds = 10;

/* GET user record. */
// TODO needs to check :auth
router.get('/:id', async (req, res) => {
	try {
		const userID = req.params.id
		var user = await getUserById(userID);
		res.send(user);
	} catch {
		res.status(404);
		res.send({ error: 'User does not exist' });
	}

});

/* POST - create user */
// TODO: needs to check :auth
router.post('/', async (req, res) => {
	try {
		const hash = await bcrypt.hash(req.body.password, saltRounds);
		let checkExists = await getUserByUsername(req.body.username);

		if (checkExists) {
			res.status(401).json({ message: "Email is already in use." });
			return;
		}
		if (err) throw new Error('Internal Server Error');
		const user = new User({
			username: req.body.username,
			passHash: hash,
			facilityName: req.body.facilityName,
			facilityAddress: req.body.facilityAddress,
			facilityPhone: req.body.facilityPhone,
			facilityEmail: req.body.facilityEmail
		});
		user.save().then(() => {
			res.json({ message: "User created successfully", user });
		});
	} catch (err) {
		res.status(401);
		res.send(err.message);
	}
});

/* PATCH - update user (user- and admin-only) */
// TODO: needs to check :auth
router.patch('/:username', async (req, res) => {
	try {
		const saltRounds = 10;
		const setPassword = req.body.password && req.body.password != ""
		const hash = await bcrypt.hash(req.body.password, saltRounds);

		const username = req.params.username;
		var updateParams = {};
		var user = await getUserByUsername(username);
		if (!user) {
			res.status(404);
			return res.send({ error: 'User does not exist' });
		}

		//username: req.body.username ? req.boy.username : {}, // Don't allow users to change username
		if (setPassword) { updateParams.passHash = hash };
		if (req.body.facilityName) { updateParams.facilityName = req.body.facilityName };
		if (req.body.facilityAddress) { updateParams.facilityAddress = req.body.facilityAddress };
		if (req.body.facilityPhone) { updateParams.facilityPhone = req.body.facilityPhone };
		if (req.body.facilityEmail) { updateParams.facilityEmail = req.body.facilityEmail };

		let updatedUser = await updateUser(user.id, updateParams);
		res.json({ message: "User updated successfully", updatedUser });

	} catch (err) {
		res.status(404);
		res.send({ error: 'User not found. ' + err });
	}

});

/* DELETE - remove user (admin only) */
// TODO: add :auth check
router.delete('/:id', function (req, res, next) {
	// No-op for now
	res.status(403);
	res.send({ error: 'Forbidden' });
});


export { router };
