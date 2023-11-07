import { Router } from "express";
import { searchForEviction } from "../models/Eviction.js";

let router = Router();

router.get('/', async (req, res) => {
	try {
		let searchParams = "";
		if (req.body.name) { searchParams += " " + req.body.name; }
		if (req.body.phone) { searchParams += " " + req.body.phone; }
		if (req.body.email) { searchParams += " " + req.body.email; }
		searchParams = searchParams.trim();
		let results = await searchForEviction(searchParams);
		res.send(results);
	} catch (err) {
		res.status(500);
		res.send({ error: 'Internal Server Error. ' + err });
	}
});

export { router };