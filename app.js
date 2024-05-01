import createError from 'http-errors';
import express from 'express';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import requestMethods from './middleware/requestMethods.js';
import routers from './routes/routers.js';
import { populateReasons } from './models/Reason.js';
import { populateSampleUsers } from './models/User.js';
import { populateSampleEvictions } from './models/Eviction.js';
import { getTokenSecret } from './lib/jwtHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting Express");

var app = express();

console.log("Configuring Express");

// view engine setup

app.use(logger('dev'));
app.use(requestMethods);
app.use(cors({
	origin: ['http://localhost:8080', 'http://localhost', 'http://stonomo.com'],
	credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(getTokenSecret())); //TODO: generate token secret if it doesn't exist
app.use(express.static(join(__dirname, 'public')));

app.get("/status", (req, res) => {

	res.send({ status: 'Running' });
});

console.log("Adding Routes");

app.use('/v1', routers.loginRouter);
app.use('/v1/password', routers.passwordRouter);
app.use('/v1/search', routers.searchRouter);
app.use('/v1/users', routers.userRouter);
app.use('/v1/reasons', routers.reasonRouter);
app.use('/v1/evictions', routers.evictionRouter);
// app.use('/tc', routers.testClientRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.json({
		message: err.message,
		error: err
	});
});

console.log("Connecting to Database");

let connectStatus;
try {
	const mongooseOptions = {
		auth: {
			username: process.env.COSMOSDB_USER,
			password: process.env.COSMOSDB_PASS
		},
		autoIndex: process.env.NODE_ENV === 'development', // only auto-build indexes on development
		tls: true,
		retryWrites: false,
		dbName: process.env.COSMOSDB_DBNAME
	};
	connectStatus = await mongoose.connect('mongodb://' + process.env.MONGODB_URI, mongooseOptions);
} catch (err) {
	console.error('Failed to connect to MongoDB');
	console.error(err);
	process.exit(1);
};

console.log("Connection Success!" + process.env.MONGODB_URI);

console.log("Populating Reasons List");

await populateReasons();

// TODO: Move this to setup script
console.log("Populating Sample Data");

await populateSampleUsers();
await populateSampleEvictions();

console.log("Opening Ports");

app.listen(process.env.PORT || 3000, () => {
	console.log("Server listening on port:", process.env.PORT);
});


export default app;
