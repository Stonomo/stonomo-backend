import { Router } from 'express';
import { User, getUserById, getUserByUsername, updateUser } from '../models/User.js';
import bcrypt from 'bcrypt';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { getTokenFromRequest, getUseridFromToken, getUsernameFromToken } from '../lib/jwtHelper.js';

var router = Router();
const saltRounds = Number(process.env.BCRYPT_SALT);

router.get('/get-free-searches', authenticateToken, async (req, res) => {
	try {
		const userId = getUseridFromToken(getTokenFromRequest(req));
		var user = await getUserById(userId);
		res.send(JSON.stringify(user.freeSearches));
	} catch (err) {
		res.status(404);
		res.send({ error: 'User does not exist', message: err.message })
	}
});

/* GET user's own user record. */
router.get('/', authenticateToken, async (req, res) => {
	try {
		const userId = getUseridFromToken(getTokenFromRequest(req));
		var user = await getUserById(userId);
		res.send(user);
	} catch (err) {
		res.status(404);
		res.send({ error: 'User does not exist ' + err.message });
	}

});

/* GET user record. */
router.get('/:userId', authenticateToken, async (req, res) => {
	try {
		const userId = req.params.userId;
		var user = await getUserById(userId);
		res.send(user);
	} catch {
		res.status(404);
		res.send({ error: 'User does not exist' });
	}

});

// TODO: require admin credentials to create user
// /* POST - create user */
// router.post('/', authenticateToken, async (req, res) => {
// 	try {
// 		const hash = await bcrypt.hash(req.body.password, saltRounds);
// 		let checkExists = await getUserByUsername(req.body.username);

// 		if (checkExists) {
// 			res.status(401).json({ message: "username is already in use." });
// 			return;
// 		}
// 		if (err) throw new Error('Internal Server Error');
// 		const user = new User({
// 			username: req.body.username,
// 			passHash: hash,
// 			facilityName: req.body.facilityName,
// 			facilityAddress: req.body.facilityAddress,
// 			facilityPhone: req.body.facilityPhone,
// 			facilityEmail: req.body.facilityEmail
// 		});
// 		user.save().then(() => {
// 			res.json({ message: "User created successfully", user });
// 		});
// 	} catch (err) {
// 		res.status(401);
// 		res.send(err.message);
// 	}
// });

/* PATCH - update user (user- and admin-only) */
router.patch('/', authenticateToken, async (req, res) => {
	try {
		const setPassword = req.body.password && req.body.password != '';
		let hash;

		let updateParams = { facilityAddress: {} };
		if (setPassword) {
			hash = await bcrypt.hash(req.body.password, saltRounds);
			req.body.password = '';
			updateParams.passHash = hash;
		};
		const username = getUsernameFromToken(getTokenFromRequest(req));
		const user = await getUserByUsername(username);
		if (!user) {
			res.status(404);
			return res.send({ error: 'User does not exist' });
		}

		if (req.body.facilityName) { updateParams.facilityName = req.body.facilityName };
		if (req.body.facilityPhone) { updateParams.facilityPhone = req.body.facilityPhone };
		if (req.body.facilityEmail) { updateParams.facilityEmail = req.body.facilityEmail };
		if (req.body.facilityAddrChange) {
			updateParams.facilityAddress.street1 = req.body.facilityAddrSt1;
			updateParams.facilityAddress.street2 = req.body.facilityAddrSt2;
			updateParams.facilityAddress.street3 = req.body.facilityAddrSt3;
			updateParams.facilityAddress.city = req.body.facilityAddrCity;
			updateParams.facilityAddress.state = req.body.facilityAddrState;
			updateParams.facilityAddress.zip = req.body.facilityAddrZip
		};

		let updatedUser = await updateUser(user._id, updateParams);
		res.json({ message: "User updated successfully", updatedUser });

	} catch (err) {
		res.status(404);
		res.send({ error: 'User not found. ' + err });
	}

});

// TODO: require admin credentials to delete user
// /* DELETE - remove user (admin only) */
// router.delete('/:id', authenticateToken, function (req, res, next) {
// 	// No-op for now
//  /* Considerations:
//	* Deleting a user means potentially orphaning eviction records
//	* Disabling a user record or creating a "foster" placeholder user are possible solutions */
// 	res.status(403);
// 	res.send({ error: 'Forbidden' });
// });


export { router };
