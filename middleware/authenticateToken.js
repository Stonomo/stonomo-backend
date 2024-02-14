import jwt from 'jsonwebtoken'
import { getTokenSecret } from '../lib/jwtHelper.js'

export async function authenticateToken(req, res, next) {
	const token = req.signedCookies?.stonomoToken;

	if (token == null) { console.log("null token"); return res.sendStatus(401); }

	jwt.verify(
		token,
		getTokenSecret(),
		(err, user) => {
			if (err) {
				console.log(err)
				return res.sendStatus(403);
			}

			req.user = user;

			next();
		}
	)
}