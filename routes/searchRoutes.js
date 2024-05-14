import { Router } from "express";
import {
	searchEvictionsByUser,
	searchForEviction
} from "../models/Eviction.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import {
	getTokenFromRequest,
	getUseridFromToken
} from "../lib/jwtHelper.js";
import {
	decrementUserFreeSearches,
	userHasFreeSearches
} from "../models/User.js";

const router = Router();

router.post('/', authenticateToken, async (req, res) => {
	try {
		const userId = getUseridFromToken(getTokenFromRequest(req))
		const searchName = req.body.searchName.trim();
		const searchPhone = req.body.searchPhone?.trim();
		const searchEmail = req.body.searchEmail?.trim();
		if (!await userHasFreeSearches(userId)) {
			throw new Error('User has no available free searches');
		} else {
			const results = await searchForEviction(searchName, searchPhone, searchEmail);
			await decrementUserFreeSearches(userId);
			res.send(results);
		}
	} catch (err) {
		res.status(500);
		res.send({ error: 'Internal Server Error. ' + err });
	}
});

/* search for eviction listings by reporting user. */
router.post('/by-user', authenticateToken, async (req, res) => {
	try {
		const userId = getUseridFromToken(getTokenFromRequest(req))
		const searchName = req.body.searchName.trim();
		const searchPhone = req.body.searchPhone?.trim();
		const searchEmail = req.body.searchEmail?.trim();
		const results = await searchEvictionsByUser(searchName, searchPhone, searchEmail, userId);
		res.send(results);
	} catch (err) {
		res.status(404);
		res.send({ error: 'Eviction record does not exist' });
	}

});

export { router };