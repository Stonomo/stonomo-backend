import jwt from 'jsonwebtoken'
import { getTokenSecret } from '../lib/jwtHelper.js'
import { Token } from '../models/Token.js';

export async function authenticateToken(req, res, next) {
	try {
		const { accessToken } = req.body;

		if (accessToken == null) {
			console.log("null token");
			return res.sendStatus(401);
		}

		jwt.verify(
			accessToken,
			getTokenSecret(),
			async (err, payload) => {
				if (err) {
					console.error('Invalid token')
					console.error(err)
					return res.status(403).send('Invalid Token');
				}

				const existingToken = Token.find({ tokenFamily: payload.tokenFamily, tokenType: 'access', nonce: payload.nonce });

				if (!existingToken) {
					// Invalidate all tokens of the same family
					await Token.deleteMany({ tokenFamily: payload.tokenFamily });
					return res.status(403).json({ message: 'Invalid nonce. Token family invalidated.' });
				}

				const newerTokenExists = await Token.exists({ tokenFamily: payload.tokenFamily, tokenType: 'access', createdAt: { $gt: existingToken.createdAt } });

				if (newerTokenExists) {
					// Invalidate all tokens of the same family
					await Token.deleteMany({ tokenFamily: payload.tokenFamily });
					return res.status(403).json({ message: 'Existing token is not the most recent one. Token family invalidated.' });
				}

				req.access = payload;

				next();
			}
		)
	} catch (err) {
		console.error(err);
	}
}