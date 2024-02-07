import jwt from 'jsonwebtoken'

export async function generateAccessToken(user) {
	const TOKEN_SECRET = await readFile(process.env.TOKEN_SECRET_FILE);
	return jwt.sign({ name: user.username, id: user._id }, TOKEN_SECRET, { expiresIn: 60 * 60 * 24 });
}

export function getUsernameFromToken(token) {
	const { name } = jwt.decode(token);
	return name;
}

export function getUseridFromToken(token) {
	const { userid } = jwt.decode(token);
	return userid;
}

export function extractTokenFromAuthHeader(headers) {
	const authHeader = headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	return token;
}