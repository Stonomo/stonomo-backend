import { Router } from 'express';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';

import { getUserByIdLean, getUserByUsername } from '../models/User.js';
import {
	generateAccessToken,
	generateRefreshToken,
	getRefreshTokenSecret,
	generateNonce
} from '../lib/jwtHelper.js';
import { Token } from '../models/Token.js';

var router = Router();

/* POST login. */
router.post('/login', async (req, res) => {
	try {

		let user = await getUserByUsername(req.body.username);

		if (!user) {
			return res.status(401).json({ message: "Invalid Credentials" });
		}

		// Compare passwords
		const result = await bcrypt.compare(req.body.password, user.passHash);
		if (!result) {
			return res.status(401).json({ message: "Invalid Credentials" });
		}

		const tokenFamily = generateNonce();
		const nonce = generateNonce();

		const accessToken = await generateAccessToken(user, tokenFamily, nonce);
		const refreshToken = await generateRefreshToken(user, tokenFamily, nonce);

		res.json({ refreshToken, accessToken });
	} catch (err) {
		res.status(401).send(err.message);
	}
});

// Refresh token route
router.post('/refresh-token', async (req, res) => {
	const { refreshToken } = req.body;
	let createNewTokenFamily = false

	if (!refreshToken) {
		return res.status(403).json({ message: 'Refresh token is required' });
	}

	jwt.verify(refreshToken, getRefreshTokenSecret(), async (err, decoded) => {
		if (err) {
			return res.status(403).json({ message: 'Invalid refresh token' });
		}

		const { id, tokenType, tokenFamily, nonce } = decoded;

		if (tokenType !== 'refresh') {
			return res.status(403).json({ message: 'Invalid token type' });
		}

		// Check if nonce is valid
		const existingToken = await Token.findOne({ tokenFamily, tokenType: 'refresh', nonce });

		if (!existingToken) {
			// Invalidate all tokens of the same family
			await Token.deleteMany({ tokenFamily });
			return res.status(403).json({ message: 'Invalid nonce. Token family invalidated.' });
			createNewTokenFamily = true;
		}

		// Check if the existing token is the most recent one
		const newerTokenExists = await Token.exists({ tokenFamily, tokenType: 'refresh', createdAt: { $gt: existingToken.createdAt } });

		if (newerTokenExists) {
			// Invalidate all tokens of the same family
			await Token.deleteMany({ tokenFamily });
			return res.status(403).json({ message: 'Existing token is not the most recent one. Token family invalidated.' });
			createNewTokenFamily = true;
		}

		let newTokenFamily = tokenFamily;
		if (createNewTokenFamily) {
			newTokenFamily = generateNonce();
		}

		const user = await getUserByIdLean(id);

		// Generate new access and refresh tokens with a new nonce
		const newNonce = generateNonce();
		const newAccessToken = await generateAccessToken(user, newTokenFamily, newNonce);
		const newRefreshToken = await generateRefreshToken(user, newTokenFamily, newNonce);

		res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
	});
});


export { router };
