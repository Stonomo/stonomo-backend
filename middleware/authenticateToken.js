import jwt from 'jsonwebtoken'
import { getTokenSecret } from '../lib/jwtHelper.js'

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
			(err, user) => {
				if (err) {
					console.error('Invalid token')
					console.error(err)
					return res.status(403).send('Invalid Token');
				}

				req.user = user;

				next();
			}
		)
	} catch (err) {
		console.error(err);
	}
}