import { Router } from "express";
import { searchForEviction } from "../models/Eviction.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

let router = Router();

router.post('/', authenticateToken, async (req, res) => {
	try {
		let searchName = req.body.searchName.trim();
		let searchPhone = req.body.searchPhone.trim();
		let searchEmail = req.body.searchEmail?.trim();
		let results = await searchForEviction(searchName, searchPhone, searchEmail);
		res.send(results);
	} catch (err) {
		res.status(500);
		res.send({ error: 'Internal Server Error. ' + err });
	}
});

export { router };