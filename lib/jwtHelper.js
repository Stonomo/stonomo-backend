import jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

export function getTokenSecret() {

	return process.env.TOKEN_SECRET || readFileSync(process.env.TOKEN_SECRET_FILE, 'utf-8');
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