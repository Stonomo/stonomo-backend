import { Router } from 'express';
import { User, getUserById, updateUser } from '../models/User.js';

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
		const user = new User({
			username: req.body.username,
			passHash: req.body.passHash,
			facilityName: req.body.facilityName,
			facilityAddress: req.body.facilityAddress,
			facilityPhone: req.body.facilityPhone,
			facilityEmail: req.body.facilityEmail
		});
		await user.save();
		res.send(user);
	} catch {
		res.status(500);
		res.send({ error: 'Internal Server Error' });
	}
})

/* PATCH - update user (user- and admin-only) */
// TODO: needs to check :auth
router.patch('/:id', async (req, res) => {
	try {
		const userID = req.params.id
		// var user = await getUserById(userID);
		var updateParams = {}
		//username: req.body.username ? req.boy.username : {}, // Don't allow users to change own username
		if (req.body.passHash) { updateParams.passHash = req.body.passHash };
		if (req.body.facilityName) { updateParams.facilityName = req.body.facilityName };
		if (req.body.facilityAddress) { updateParams.facilityAddress = req.body.facilityAddress };
		if (req.body.facilityPhone) { updateParams.facilityPhone = req.body.facilityPhone };
		if (req.body.facilityEmail) { updateParams.facilityEmail = req.body.facilityEmail };

		let user = await updateUser(userID, updateParams);
		res.send(user);
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
