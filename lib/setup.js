import {
	Eviction,
	countEvictionsByUser
} from '../models/Eviction.js';
import {
	User,
	getUserByUsername
} from '../models/User.js';

export async function conditionallyPopulateTestUsers() {
	let testusers = await User.countDocuments({ $or: [{ username: 'test-user' }, { username: 'test-user-paid' }] });
	if (testusers < 2) {
		await populateTestUsers();
	}
}

export async function populateTestUsers() {
	console.log("-Importing test users")

	const testUserData = await import('../data/testusers.json', { with: { type: "json" } });
	console.log("-Transforming user data")
	const userArray = []
	const users = testUserData['default']
	for (const user of users) {
		userArray.push({
			replaceOne: {
				upsert: true,
				filter: { _id: user._id.$oid },
				replacement: {
					username: user.username,
					passHash: user.passHash,
					facilityName: user.facilityName,
					facilityAddress: user.facilityAddress,
					facilityPhone: user.facilityPhone,
					facilityEmail: user.facilityEmail,
					testData: user.testData
				}
			}
		});

	}
	console.log("-Writing user data to db")
	await User.bulkWrite(userArray);

}

export async function populateSampleUsers() {
	console.log("-Importing sample users")
	const mockUserData = await import('../data/MOCKusers.json', { with: { type: "json" } });
	console.log("-Transforming user data")
	const userArray = []
	const users = mockUserData['default']
	for (const user of users) {
		userArray.push({
			replaceOne: {
				upsert: true,
				filter: { _id: user._id.$oid },
				replacement: {
					username: user.username,
					passHash: user.passHash,
					facilityName: user.facilityName,
					facilityAddress: user.facilityAddress,
					facilityPhone: user.facilityPhone,
					facilityEmail: user.facilityEmail,
					testData: true
				}
			}
		});

	}
	console.log("-Writing user data to db")
	await User.bulkWrite(userArray);
}

export async function populateSampleEvictions(configure = false) {
	console.log("-Importing sample eviction data");
	const mockEvictionData = await import('../data/MOCKevictions.json', { with: { type: "json" } });
	console.log("-Transforming eviction data");
	const evictionArray = [];
	const evics = mockEvictionData['default'];
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

	if (configure) {
		console.log("-Configuring sample data");
		const testuserId = await getUserByUsername('test-user')._id;
		const testuserEvictions = await countEvictionsByUser(testuserId);
		// Assign 10% of test data to test-user if there's < 10 assigned already
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
			);
		};
	}
}
