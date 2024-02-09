import mongoose from 'mongoose';
import { getUserByUsername } from './User.js';

//TODO: add validation and error handling
const evictionsSchema = new mongoose.Schema({
	tenantName: {
		type: String,
		required: true,
		index: true
	},
	tenantPhone: {
		type: String,
		index: true
	},
	tenantEmail: {
		type: String,
		index: true
	},
	user: {
		type: mongoose.ObjectId,
		ref: 'User',
		required: true,
		index: true
	},
	reason: {
		type: mongoose.ObjectId,
		ref: 'Reason',
		required: true,
		index: true
	},
	details: {
		type: String,
		required: true,
		index: true
	},
	evictedOn: {
		type: Date,
		required: true,
		index: true
	},
	testData: {
		type: Boolean,
		required: true,
		default: false
	}
}, { timestamps: true });

const confirmEvictionsSchema = evictionsSchema.clone()

evictionsSchema.index({ tenantName: "text", tenantPhone: "text", tenantEmail: "text" });
confirmEvictionsSchema.index({ "createdAt": 1 }, { expireAfterSeconds: 60 * 60 * 24 })

export const Eviction = mongoose.model("Eviction", evictionsSchema);
export const ConfirmEviction = mongoose.model("ConfirmEviction", confirmEvictionsSchema);

export async function addEviction(
	tenantName,
	tenantPhone,
	tenantEmail,
	user,
	reason,
	details,
	evictedOn
) {
	let e = await Eviction.create({
		tenantName: tenantName,
		tenantPhone: tenantPhone,
		tenantEmail: tenantEmail,
		user: user,
		reason: reason,
		details: details,
		evictedOn: evictedOn,
		testData: false
	});
	return e._id.toString();
}

export async function addConfirmEviction(
	tenantName,
	tenantPhone,
	tenantEmail,
	user,
	reason,
	details,
	evictedOn
) {
	let e = await ConfirmEviction.create({
		tenantName: tenantName,
		tenantPhone: tenantPhone,
		tenantEmail: tenantEmail,
		user: user,
		reason: reason,
		details: details,
		evictedOn: evictedOn,
		testData: false
	});
	return e._id.toString();
}

export async function getEvictionById(id) {
	let e = await Eviction.findById(id)
		.populate('user', 'facilityName facilityPhone')
		.populate('reason', 'desc');
	return e;
}

export async function getConfirmEvictionById(id) {
	let e = await ConfirmEviction.findById(id)
		.populate('user', 'facilityName facilityPhone')
		.populate('reason', 'desc');
	return e;
}

export async function getEvictionByIdLean(id) {
	let e = await Eviction.findById(id)
		.populate('user', 'facilityName facilityPhone')
		.populate('reason', 'desc')
		.lean();
	return e;
}

export async function countEvictionsByUser(username) {
	const { _id } = await getUserByUsername(username);
	const e = await Eviction.countDocuments({ user: _id })
		.populate('user', 'facilityName facilityPhone')
		.populate('reason', 'desc');
	return e;
}

export async function getEvictionsByUser(username) {
	const { _id } = await getUserByUsername(username);
	const e = await Eviction.find({ user: _id })
		.populate('user', 'facilityName facilityPhone')
		.populate('reason', 'desc');
	return e;
}

export function updateEviction(id, ...fields) {
	let updateParams = {}
	for (let i = 0; i < fields.length - 1; i++) {
		const key = fields[i];
		const value = fields[i + 1];
		updateParams[key] = value;
	}

	let e = Eviction.findByIdAndUpdate(id, { $set: updateParams })
		.lean();
	return e;
}

export async function searchForEviction(textSearchParams) {
	// TODO: change to use regex on tenant fields
	const e = await Eviction.find({ $text: { $search: textSearchParams } })
		.populate('user', 'facilityName facilityPhone')
		.populate('reason', 'desc')
		// .limit(10)
		.lean();
	//search Evictions by querying Eviction
	return e;
}

export async function deleteEviction(id) {
	let e = await Eviction.findByIdAndDelete(id)
	return e._id.toJSON();
}

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
	console.log("-Writing eviction data to db");
	await Eviction.bulkWrite(evictionArray);

	console.log("-Configuring sample data")

	const testuserEvictions = await countEvictionsByUser('test-user');
	if (testuserEvictions < 10) {
		const testuserId = getUserByUsername('test-user')._id
		Eviction.updateMany(
			{
				$expr: {
					$lt: [{ $rand: {} }, 0.1]
				}
			},
			[{
				$set: {
					user: testuserId
				}
			}]
		)
	};
}