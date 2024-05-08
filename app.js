import { createServer } from 'http';
import { existsSync, readFileSync, readdirSync } from 'fs';
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
import { populateTestUsers } from './lib/setup.js';
import { getTokenSecret } from './lib/jwtHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

console.log("Starting Express");

let app = express();

console.log("Configuring Express");

app.use(logger('dev'));
app.use(requestMethods);
app.use(cors({
	origin: ['http://localhost:8080', 'http://localhost', 'https://stonomo.com'],
	credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(getTokenSecret()));
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
app.use('/v1/admin', routers.adminRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = isDev ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.json({
		message: err.message,
		error: err
	});
});

console.log("Connecting to Database:", `mongodb://${mongoHost}:${mongoPort}`);

try {
	await mongoose.connect(`mongodb://${mongoHost}:${mongoPort}`, mongooseOptions);
} catch (err) {
	console.error('Failed to connect to MongoDB');
	console.error(`URI: ${mongoHost}:${mongoPort}`);
	console.error(err);
	process.exit(1);
};

console.log("Connection Success! " + mongoHost);

console.log('Creating test users');

await conditionallyPopulateTestUsers();

console.log("Opening Ports");
const server = createServer(app);

server.listen(port || 3000, () => {
	console.log("Server listening on port:", port);
});

export default app;
