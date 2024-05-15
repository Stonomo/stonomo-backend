import jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import crypto from 'crypto'
import { storeToken } from '../models/Token.js';

let token_secret;
export function getTokenSecret() {
	if (token_secret === undefined) {
		if (process.env.TOKEN_SECRET) {
			token_secret = process.env.TOKEN_SECRET;
		} else {
			token_secret = readFileSync(process.env.TOKEN_SECRET_FILE, 'utf-8');
		}
	}
	return token_secret;
}

let refresh_token_secret;
export function getRefreshTokenSecret() {
	if (refresh_token_secret === undefined) {
		if (process.env.REFRESH_TOKEN_SECRET) {
			refresh_token_secret = process.env.REFRESH_TOKEN_SECRET;
		} else {
			refresh_token_secret = readFileSync(process.env.REFRESH_TOKEN_SECRET_FILE, 'utf-8');
		}
	}
	return refresh_token_secret;
}

export async function generateAccessToken(user, tokenFamily, nonce) {
	const accessTokenPayload = {
		name: user.username,
		id: user._id,
		plan: user.plan,
		tokenFamily,
		nonce,
		tokenType: 'access'
	};
	const token = jwt.sign(
		accessTokenPayload,
		getTokenSecret(),
		{ expiresIn: 60 * 60 } // One hour token TTL
	);
	await storeToken(user, 'access', tokenFamily, nonce);
	return token;
}

export async function generateRefreshToken(user, tokenFamily, nonce) {
	const refreshTokenPayload = {
		id: user._id,
		tokenFamily,
		nonce,
		tokenType: 'refresh'
	};
	const token = jwt.sign(
		refreshTokenPayload,
		getRefreshTokenSecret(),
		{ expiresIn: 60 * 60 } // One hour token TTL
	);
	await storeToken(user, 'refresh', tokenFamily, nonce);
	return token;
}

export function getTokenFromRequest(req) {
	return jwt.decode(req.body.authToken);
}

export function getUsernameFromToken(token) {
	const { name } = token;
	return name;
}

export function getUseridFromToken(token) {
	const { id } = token;
	return id;
}

export function getPlanFromToken(token) {
	const { plan } = token;
	return plan;
}

export function generateNonce() {
	return crypto.randomBytes(16).toString("hex");
}
