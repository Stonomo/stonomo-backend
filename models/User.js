import mongoose from 'mongoose';

var ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = mongoose.Schema({
	username: { type: String, required: true, select: true, index: true },
	passHash: { type: String, required: true },
	facilityName: { type: String, required: true, select: true },
	facilityAddress: { type: String, required: true },
	facilityPhone: { type: String, required: true, select: true },
	facilityEmail: { type: String, required: true }
});

export const User = mongoose.model('User', userSchema);

export function addUser(username, pass_hash, facilityName, facilityAddress, facilityPhone, facilityEmail) {
	let u = User.create(username, pass_hash, facilityName, facilityAddress, facilityPhone, facilityEmail)
		.then(console.log);
	return u;
}

export function getUserById(id) {
	let u = User.findById(id);
	return u;
}

export function getUserByIdLean(id) {
	let u = User.findById(id)
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

// //TODO: delete function needs to be protected for security reasons
// export function __deleteUser(id) {
// 	let u = User.findByIdAndDelete(id)
// 		.lean()
// 		.then(console.log);
// 	return u;
// }