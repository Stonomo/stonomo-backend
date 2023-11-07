import { Router } from 'express';
import { User, getUserById, getUserByUsername, updateUser } from '../models/User.js';
import bcrypt from 'bcrypt';

var router = Router();

/* GET user record. */
// TODO needs to check :auth
router.get('/:id', async (req, res) => {
	try {
		const userID = req.params.id
		var user = await getUserById(userID);
		res.send(user);
	} catch {
		res.status(404);
		res.send({ error: 'user record does not exist' });
	}

});

/* POST - create user */
// TODO: needs to check :auth
router.post('/', async (req, res) => {
	try {
		let checkExists = await getUserByUsername(req.body.username);

		if (checkExists) {
			res.status(401).json({ message: "Email is already in use." });
			return;
		}
		const saltRounds = 10;
		bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
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
		});
	} catch (err) {
		res.status(401);
		res.send(err.message);
	}
});

/* PATCH - update user (user- and admin-only) */
// TODO: needs to check :auth
router.patch('/:id', async (req, res) => {
	try {
		const userID = req.params.id;
		// var user = await getUserById(userID);
		var updateParams = {};
		const saltRounds = 10;
		bcrypt.hashSync(req.body.password, saltRounds, (err, hash) => {
			if (err) throw new Error('Internal Server Error');
			//username: req.body.username ? req.boy.username : {}, // Don't allow users to change username
			if (req.body.passHash) { updateParams.passHash = hash };
			if (req.body.facilityName) { updateParams.facilityName = req.body.facilityName };
			if (req.body.facilityAddress) { updateParams.facilityAddress = req.body.facilityAddress };
			if (req.body.facilityPhone) { updateParams.facilityPhone = req.body.facilityPhone };
			if (req.body.facilityEmail) { updateParams.facilityEmail = req.body.facilityEmail };

			let user = updateUser(userID, updateParams).then(() => {
				res.json({ message: "User updated successfully", user });
			});
		});
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
