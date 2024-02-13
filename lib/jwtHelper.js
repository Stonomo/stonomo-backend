import jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'

export function getTokenSecret() {
	return readFileSync(process.env.TOKEN_SECRET_FILE, 'utf-8');
}

export async function generateAccessToken(user) {
	return jwt.sign({ name: user.username, id: user._id }, getTokenSecret(), { expiresIn: 60 * 60 });
}

export async function generateRefreshToken(user) {
	return jwt.sign({ name: user.username }, getTokenSecret(), { expiresIn: 60 * 60 * 24 });
}

export function getUsernameFromToken(token) {
	const { name } = jwt.decode(token);
	return name;
}

export function getUseridFromToken(token) {
	const { id } = jwt.decode(token);
	return id;
}

export function extractTokenFromAuthHeader(headers) {
	const authHeader = headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	return token;
}