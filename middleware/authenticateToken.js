import jwt from 'jsonwebtoken'
import { readFile } from 'fs/promises'

export async function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (token == null) return res.sendStatus(401)

	const TOKEN_SECRET = await readFile(
		process.env.TOKEN_SECRET_FILE
	)

	jwt.verify(
		token,
		TOKEN_SECRET,
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