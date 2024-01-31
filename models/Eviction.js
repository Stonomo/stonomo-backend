import mongoose from 'mongoose';
import { getUserByUsername } from './User.js';

//TODO: add validation and error handling
const evictionsSchema = new mongoose.Schema({
	tenantName: { type: String, required: true, index: true },
	tenantPhone: { type: String, index: true },
	tenantEmail: { type: String, index: true },
	user: { type: mongoose.ObjectId, ref: 'User', required: true, index: true },
	reason: { type: mongoose.ObjectId, ref: 'Reason', required: true, index: true },
	details: { type: String, required: true },
	evictedOn: { type: Date, required: true },
	testData: Boolean
}, { timestamps: true });

evictionsSchema.index({ tenantName: "text", tenantPhone: "text", tenantEmail: "text" });

export const Eviction = mongoose.model("Eviction", evictionsSchema);

export async function addEviction(tenantName, tenantPhone, tenantEmail, user, reason, details, evictedOn) {
	let e = await Eviction.create(tenantName, tenantPhone, tenantEmail, user, reason, details, evictedOn);
	return e;
}

export function getEvictionById(id) {
	let e = Eviction.findById(id)
		.populate('user', 'facilityName facilityPhone')
		.populate('reason', 'desc');
	return e;
}

export function getEvictionByIdLean(id) {
	let e = Eviction.findById(id)
		.populate('user', 'facilityName facilityPhone')
		.populate('reason', 'desc')
		.lean();
	return e;
}

export async function getEvictionsByUser(username) {
	const { _id } = await getUserByUsername(username);
	const id = _id;
	const query = Eviction.find({ user: id })
		.populate('user', 'facilityName facilityPhone')
		.populate('reason', 'desc');
	return await query;
}

export function updateEviction(id, ...fields) {
	let updateParams = {}
	for (let i = 0; i < fields.length - 1; i++) {
		const key = fields[i];
		const value = fields[i + 1];
		updateParams[key] = value;
	}

	let e = Eviction.findByIdAndUpdate(id, { $set: updateParams })
		.lean()
		.then(console.log);
	return e;
}

export async function searchForEviction(textSearchParams) {
	// TODO: change to use regex on tenant fields
	const findQuery = Eviction.find({ $text: { $search: textSearchParams } })
		.populate('user', 'facilityName facilityPhone')
		.populate('reason', 'desc')
		.limit(10)
		.lean();
	//search Evictions by querying Eviction
	return await findQuery;
}

// //TODO: delete function needs to be protected for security reasons
// export function __deleteEviction(id) {
// 	let e = Eviction.findByIdAndDelete(id)
// 		.lean()
// 		.then(console.log);
// 	return e;
// }

export async function populateSampleEvictions() {
	console.log("-Importing sample eviction data")
	const mockEvictionData = await import('../data/MOCKevictions.json', { with: { type: "json" } });
	console.log("-Transforming eviction data")
	const evictionArray = []
	for (const ix in mockEvictionData) {
		const evics = mockEvictionData[ix]
		for (const evic of evics) {
			evictionArray.push({
				replaceOne: {
					upsert: true,
					filter: { _id: evic._id.$oid },
					replacement: {
						tenantName: evic.tenantName,
						tenantPhone: evic.tenantPhone,
						tenantEmail: evic.tenantEmail,
						user: evic.user.$oid,
						reason: evic.reason.$oid,
						details: evic.details,
						evictedOn: evic.evictedOn,
						testData: true
					}
				}
			});
		}
	}
	console.log("-Writing eviction data to db")
	await Eviction.bulkWrite(evictionArray);
}