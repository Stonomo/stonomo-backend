import jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

let token_secret;
export function getTokenSecret() {
	if (!token_secret) {
		if (process.env.TOKEN_SECRET) {
			token_secret = process.env.TOKEN_SECRET;
		} else {
			token_secret = readFileSync(process.env.TOKEN_SECRET_FILE, 'utf-8');
		}
	}
	return token_secret;
}

export async function generateAccessToken(user) {
	return jwt.sign(
		{ name: user.username, id: user._id, plan: user.plan },
		getTokenSecret(),
		{ expiresIn: 60 * 60 } // One hour token TTL
	);
}

export async function generateRefreshToken(user) {
	return jwt.sign(
		{ name: user.username, id: user._id, plan: user.plan },
		getTokenSecret(),
		{ expiresIn: 60 * 60 } //One hour token TTL
	);
}

export function getTokenFromRequest(req) {
	return req.signedCookies?.stonomoToken;
}

export function getUsernameFromToken(token) {
	const { name } = jwt.decode(token);
	return name;
}

export function getUseridFromToken(token) {
	const { id } = jwt.decode(token);
	return id;
}

export function getPlanFromToken(token) {
	const { plan } = jwt.decode(token);
	return plan;
}