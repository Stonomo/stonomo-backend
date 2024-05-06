import { createServer } from 'https';
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

let certFilePath;
if (existsSync(`/var/ssl/private/${process.env.ssl_thumbprint}.p12`)) {
	certFilePath = `/var/ssl/private/${process.env.ssl_thumbprint}.p12`;
	console.log('Using Azure-provided certificate');
} else {
	certFilePath = './secrets/Stonomoapi-current.pfx';
	console.log('Using local certificate');
}
const sslCreds = {
	pfx: readFileSync(certFilePath),
}

console.log("Starting Express");

var app = express();

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
	res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.json({
		message: err.message,
		error: err
	});
});

console.log("Connecting to Database");

try {
	await mongoose.connect(`mongodb://${process.env.COSMOSDB_HOST}:${process.env.COSMOSDB_PORT}`, mongooseOptions);
} catch (err) {
	console.error('Failed to connect to MongoDB');
	console.error(`URI: ${process.env.COSMOSDB_HOST}:${process.env.COSMOSDB_PORT}`);
	console.error(err);
	process.exit(1);
};

console.log("Connection Success! " + process.env.COSMOSDB_HOST);

console.log('Creating test users');

await populateTestUsers();

console.log("Opening Ports");
const server = createServer(sslCreds, app);

server.listen(process.env.PORT || 3000, () => {
	console.log("Server listening on port:", process.env.PORT);
});

export default app;
