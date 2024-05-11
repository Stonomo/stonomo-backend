import mongoose from 'mongoose';
import {
	Eviction,
	countEvictionsByUser
} from '../models/Eviction.js';
import {
	User,
	getUserByUsername
} from '../models/User.js';

export async function connectToDatabase() {
	const isDev = process.env.NODE_ENV === 'development';

	const mongoHost = process.env.COSMOSDB_HOST,
		mongoPort = process.env.COSMOSDB_PORT,
		mongoUser = process.env.COSMOSDB_USER,
		mongoPass = process.env.COSMOSDB_PASS,
		mongoDbName = process.env.COSMOSDB_DBNAME,
		port = process.env.PORT;

	const mongooseOptions = {
		auth: {
			username: mongoUser,
			password: mongoPass
		},
		autoIndex: isDev, // only auto-build indexes on development
		tls: !isDev, // no TLS on local dev
		retryWrites: false,
		dbName: mongoDbName
	};

	console.log("Connecting to Database:", `mongodb://${mongoHost}:${mongoPort}`);

	try {
		mongoose.connect(`mongodb://${mongoHost}:${mongoPort}`, mongooseOptions).then(() => {
			console.log("Connection Success! " + mongoHost);
		});
	} catch (err) {
		console.error('Failed to connect to MongoDB');
		console.error(`URI: ${mongoHost}:${mongoPort}`);
		console.error(err);
	};
}

export async function conditionallyPopulateTestUsers() {
	let testusers = await User.countDocuments({
		$or: [
			{
				username: 'test-user'
			}, {
				username: 'testuser-paid'
			}, {
				username: 'testuser-admin'
			}]
	});
	if (testusers < 3) {
		await populateTestUsers();
		console.log('Test Users populated')
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
					plan: user.plan,
					admin: user.admin,
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
					testData: user.testData
				}
			}
		});

	}
	console.log("-Writing user data to db")
	await User.bulkWrite(userArray);
}

export async function populateTestEvictions() {
	console.log("-Importing test eviction data");
	const mockEvictionData = await import('../data/testevictions.json', { with: { type: "json" } });
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
					tenantNameLower: evic.tenantName.toLowerCase(),
					tenantPhone: evic.tenantPhone,
					tenantEmail: evic.tenantEmail.toLowerCase(),
					user: evic.user.$oid,
					reason: evic.reason,
					details: evic.details,
					evictedOn: evic.evictedOn,
					testData: evic.testData
				}
			}
		});
	}
	console.log("-Writing eviction data to db");
	await Eviction.bulkWrite(evictionArray);
}

export async function populateSampleEvictions() {
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
					tenantNameLower: evic.tenantName.toLowerCase(),
					tenantPhone: evic.tenantPhone,
					tenantEmail: evic.tenantEmail.toLowerCase(),
					user: evic.user.$oid,
					reason: evic.reason,
					details: evic.details,
					evictedOn: evic.evictedOn,
					testData: evic.testData
				}
			}
		});
	}
	console.log("-Writing eviction data to db");
	await Eviction.bulkWrite(evictionArray);
}

export async function configureSampleEvictions() {
	console.log("-Configuring sample data");
	const testuserId = await getUserByUsername('test-user')._id;
	const testuserpaidId = await getUserByUsername('testuser-paid')._id;
	const testuserEvictions = await countEvictionsByUser(testuserId);
	const testuserpaidEvictions = await countEvictionsByUser(testuserpaidId);
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
	if (testuserpaidEvictions < 10) {
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
					user: testuserpaidId
				}
			}]
		);
	};
}
