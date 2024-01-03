import { Router } from "express";
import { searchForEviction } from "../models/Eviction.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

let router = Router();

router.post('/', authenticateToken, async (req, res) => {
	try {
		let searchParams = req.body.search.trim();
		let results = await searchForEviction(searchParams);
		res.send(results);
	} catch (err) {
		res.status(500);
		res.send({ error: 'Internal Server Error. ' + err });
	}
});

export { router };