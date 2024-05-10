import mongoose from 'mongoose';
import validator from 'validator';

const addressSchema = mongoose.Schema({
	street1: {
		type: String,
		required: true,
	},
	street2: {
		type: String,
		required: false,
	},
	city: {
		type: String,
		required: true,
		select: true,
	},
	state: {
		type: String,
		required: true,
		select: true,
	},
	zip: {
		type: String,
		required: true
	}
})

const userSchema = mongoose.Schema({
	username: {
		type: String,
		required: [true, 'Username is required'],
		select: true,
		index: true
	},
	passHash: {
		type: String,
		required: [true, 'Password is required']
	},
	facilityName: {
		type: String,
		required: true,
		select: true
	},
	facilityAddress: {
		type: addressSchema,
		required: true
	},
	facilityPhone: {
		type: String,
		required: true,
		select: true
	},
	facilityEmail: {
		type: String,
		required: true,
		validate: {
			validator: validator.isEmail,
			message: props => `${props.value} is not a valid email`
		}
	},
	plan: {
		type: String,
		required: true,
		select: true,
		index: true,
		default: 'FREE'
	},
	testData: {
		type: Boolean,
		required: true,
		default: false
	}
});

export const User = mongoose.model('User', userSchema);

export function addUser(username, pass_hash, facilityName, street1, street2, street3, city, state, zip, facilityPhone, facilityEmail, facilityPlan) {
	const facilityAddress = { street1, street2, street3, city, state, zip }
	let u = User.create(username, pass_hash, facilityName, facilityAddress, facilityPhone, facilityEmail, facilityPlan)
		.then(console.log);
	return u;
}

export async function getUserByUsername(username) {
	return await User.findOne({ username: username });
}

export async function getUserById(id) {
	let u = await User.findById(id);
	return u;
}

export async function getUserByIdLean(id) {
	let u = await User.findById(id)
		.lean();
	return u;
}

export async function getUserByEmail(email) {
	const u = await User.findOne({ facilityEmail: email })
		.lean();
	return u;
}

export async function updateUser(id, fields) {
	let updateParams = {};
	//filter out any blank values to avoid accidental data deletion
	for (const [k, v] of Object.entries(fields)) {
		// TODO: add handling for invalid params
		if (k !== '' && v != {}) {
			updateParams[k] = v;
		}
	}
	await User.findByIdAndUpdate(id, { $set: updateParams });
	return getUserByIdLean(id);
}

export function deleteUser(id) {
	let u = User.findByIdAndDelete(id)
		.lean()
		.then(console.log);
	return u;
}
