import mongoose from 'mongoose';
import {
	getUserByEmail,
	getUserById
} from './User.js';
import bcrypt from 'bcrypt';
import { sendEmail } from '../lib/sendEmail.js';

const bcryptSalt = process.env.BCRYPT_SALT;
const clientUrl = process.env.CLIENT_URL;

const tokenSchema = new mongoose.Schema({
	user: {
		type: mongoose.ObjectId,
		ref: 'User',
		required: true,
		index: true
	},
	tokenType: {
		type: String,
		required: true
	},
	tokenFamily: {
		type: String,
		required: true
	},
	nonce: {
		type: String,
		required: true
	}
}, { timestamps: true });

tokenSchema.index({ "createdAt": 1 }, { expireAfterSeconds: 60 * 60 })

export const Token = mongoose.model('Token', tokenSchema);

export async function storeToken(user, tokenType, tokenFamily, nonce) {
	try {
		await Token.create({
			user: user._id,
			tokenType,
			tokenFamily,
			nonce
		});
	} catch (err) {
		console.log(err)
	}
}

export async function generatePasswordResetLink(userEmail) {
	try {
		const user = await getUserByEmail(userEmail);
		if (!user) throw new Error('User email not found');

		// Delete any previous token so only most recent is valid
		await Token.findOneAndDelete({ user: user._id });

		const resetToken = crypto.randomBytes(32).toString('base64url');
		const hash = bcrypt.hash(resetToken, bcryptSalt);

		await new Token({
			user: user._id,
			tokenType: 'resetToken',
			nonce: hash
		}).save();

		// send email with plaintext token
		const link = `${clientUrl}/password/reset?t=${resetToken}&i=${user._id}`;
		sendEmail(
			user.facilityEmail,
			{
				name: user.facilityName,
				link: link
			},
			'requestPasswordReset.handlebars'
		);
	} catch (err) {
		console.log(err)
	}
}

export async function resetPassword(userId, token, password) {
	try {
		//hash password
		const hash = bcrypt.hash(password);

		//find resetToken
		const resetToken = Token.findOne({
			userId,
			tokenType: 'resetToken'
		});

		if (!resetToken) {
			throw new Error('Invalid or expired password reset token');
		}

		const isValid = bcrypt.compare(token, resetToken.nonce);

		if (!isValid) {
			throw new Error('Invalid or expired password reset token');
		}

		//find user
		const user = getUserById(userId);

		//store hashed password
		user.passHash = hash;
		user.save();

		//send email
		sendEmail(
			user.facilityEmail,
			'Password Changed Successfully',
			{
				name: user.facilityName
			},
			'passwordReset.handlebars'
		)

		//delete Token
		resetToken.deleteOne();
	} catch (err) {

	}
} 