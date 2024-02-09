import jwt from 'jsonwebtoken'
import { readFile } from 'fs/promises'
import { getTokenSecret } from '../lib/jwtHelper.js'

export async function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (token == null) return res.sendStatus(401)

	jwt.verify(
		token,
		getTokenSecret(),
		(err, user) => {
			if (err) {
				console.log(err)
				return res.sendStatus(403)
			}

			req.user = user

			next()
		}
	)
}