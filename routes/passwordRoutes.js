import { Router } from "express";
import { generatePasswordResetLink as emailPasswordResetLink, resetPassword } from "../models/Token.js";

let router = Router()

router.post('/', async (req, res) => {
	//request token generation
	await emailPasswordResetLink(
		req.body.email
	)
	return res.send('Password reset instructions sent')
});

router.post('/reset', async (req, res) => {
	//reset password
	const result = await resetPassword(
		req.body.userId,
		req.body.token,
		req.body.password
	)
	return res.json(result)
});

export { router };