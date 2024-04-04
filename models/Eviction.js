import mongoose from 'mongoose';
import { getUserByUsername } from './User.js';

const evictionDetailsSchema = new mongoose.Schema({
	content: {
		type: String,
		required: true
	}
}, { timestamps: true })

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
		type: String,
		required: true,
		index: true
	},
	details: {
		type: [evictionDetailsSchema],
		index: true
	},
	evictedOn: {
		type: Date,
		required: true,
		index: true
	},
	testData: {
		type: Boolean,
		default: false
	}
}, { timestamps: true });

const confirmEvictionsSchema = evictionsSchema.clone()

evictionsSchema.index({ tenantName: "text" });
confirmEvictionsSchema.index({ "createdAt": 1 }, { expireAfterSeconds: 60 * 60 * 24 })

export const Eviction = mongoose.model("Eviction", evictionsSchema);
export const ConfirmEviction = mongoose.model("ConfirmEviction", confirmEvictionsSchema);

export async function addEviction(
	tenantName,
	tenantPhone,
	tenantEmail,
	userId,
	reason,
	details,
	evictedOn
) {
	let e = await Eviction.create({
		tenantName: tenantName,
		tenantPhone: tenantPhone,
		tenantEmail: tenantEmail,
		user: userId,
		reason: reason,
		evictedOn: evictedOn,
		details: details
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
		evictedOn: evictedOn,
		testData: false,
		details: [{
			content: details
		}]
	});
	e.details.push({ content: details })
	return e._id.toString();
}

export async function getEvictionById(id) {
	let e = await Eviction.findById(id)
		.populate('user', 'facilityName')
	return e;
}

export async function getConfirmEvictionById(id) {
	let e = await ConfirmEviction.findById(id, { tenantName: 1, tenantEmail: 1, tenantPhone: 1, details: 1, evictedOn: 1, user: 1, reason: 1 })
	return e;
}

export async function getConfirmEvictionByIdLean(id) {
	let e = await ConfirmEviction.findById(id, { tenantName: 1, tenantEmail: 1, tenantPhone: 1, details: 1, evictedOn: 1, })
		.populate({ path: 'user', select: 'facilityName -_id -username -facilityPhone' })
		.lean();
	return e;
}

export async function getEvictionByIdLean(id) {
	let e = await Eviction.findById(id)
		.populate('user', 'facilityName')
		.lean();
	return e;
}

export async function countEvictionsByUser(userId) {
	const e = await Eviction.countDocuments({ user: userId })
	return e;
}

export async function getEvictionsByUser(userId) {
	const e = await Eviction.find({ user: userId }, { _id: 1, tenantName: 1, user: 1 })
		.populate({ path: 'user', select: 'facilityName _id -username -facilityPhone' })
		.lean();
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
	return e._id;
}

export async function searchForEviction(searchName, searchPhone, searchEmail) {
	const e = await Eviction.aggregate([
		{
			'$match': {
				'$or': [
					{
						'tenantName': searchName
					}, {
						'tenantPhone': searchPhone
					}, {
						'tenantEmail': searchEmail
					}
				]
			}
		}, {
			'$project': {
				'nameMatches': {
					'$cond': {
						'if': {
							'$eq': [
								'$tenantName', searchName
							]
						},
						'then': 1,
						'else': 0
					}
				},
				'phoneMatches': {
					'$cond': {
						'if': {
							'$eq': [
								'$tenantPhone', searchPhone
							]
						},
						'then': 1,
						'else': 0
					}
				},
				'emailMatches': {
					'$cond': {
						'if': {
							'$eq': [
								'$tenantEmail', searchEmail
							]
						},
						'then': 1,
						'else': 0
					}
				},
				'evictedOn': 1,
				'user': 1
			}
		}
	])
	return e;
}

export async function searchEvictionsByUser(searchName, searchPhone, searchEmail, searchUserId) {
	const e = await Eviction.aggregate([
		{
			'$match': {
				'$and': [
					{
						'user': new mongoose.Types.ObjectId(searchUserId)
					}, {
						'$or': [
							{
								'tenantName': searchName
							}, {
								'tenantPhone': searchPhone
							}, {
								'tenantEmail': searchEmail
							}
						]
					}
				]
			}
		}, {
			'$project': {
				'nameMatches': {
					'$cond': {
						'if': {
							'$eq': [
								'$tenantName', searchName
							]
						},
						'then': 1,
						'else': 0
					}
				},
				'phoneMatches': {
					'$cond': {
						'if': {
							'$eq': [
								'$tenantPhone', searchPhone
							]
						},
						'then': 1,
						'else': 0
					}
				},
				'emailMatches': {
					'$cond': {
						'if': {
							'$eq': [
								'$tenantEmail', searchEmail
							]
						},
						'then': 1,
						'else': 0
					}
				},
				'evictedOn': 1,
				'user': 1
			}
		}
	])
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
	const evics = mockEvictionData['default']
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
					reason: evic.reason,
					details: evic.details,
					evictedOn: evic.evictedOn,
					testData: true
				}
			}
		});
	}
	console.log("-Writing eviction data to db");
	await Eviction.bulkWrite(evictionArray);

	console.log("-Configuring sample data")
	const testuserId = await getUserByUsername('test-user')._id
	const testuserEvictions = await countEvictionsByUser(testuserId);
	// Assign 10% of test data to test-user
	if (testuserEvictions < 10) {
		Eviction.updateMany(
			{
				$and: [{
					$expr: {
						$lt: [{ $rand: {} }, 0.1]
					}
				}, {
					testData: true
				}]
			},
			[{
				$set: {
					user: testuserId
				}
			}]
		)
	};
}