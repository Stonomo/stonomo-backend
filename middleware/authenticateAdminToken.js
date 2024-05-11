import jwt from 'jsonwebtoken'
import { getTokenSecret } from '../lib/jwtHelper.js'

export async function authenticateAdminToken(req, res, next) {
	const token = req.signedCookies?.stonomoToken;

	if (token == null) { console.log("null token"); return res.sendStatus(401); }

	jwt.verify(
		token,
		getTokenSecret(),
		(err, token) => {
			if (err) {
				console.log(err)
				return res.sendStatus(403);
			}

			if (token.admin !== true) {
				return res.sendStatus(403);
			}

			req.token = token;
			next();
		}
	)
}