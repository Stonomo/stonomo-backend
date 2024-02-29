import createError from 'http-errors';
import express from 'express';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import lessMiddleware from 'less-middleware';
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

app.set('views', join(__dirname, 'views'));

app.use(logger('dev'));
app.use(requestMethods);
app.use(cors({
	origin: ['http://localhost:3000', 'http://localhost:5173'],
	credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(getTokenSecret()));
app.use(lessMiddleware(join(__dirname, 'public')));
app.use(express.static(join(__dirname, 'public')));

app.get("/status", (req, res) => {

	res.send({ status: 'Running' });
});

console.log("Adding Routes");

// app.use('/', routers.loginRouter);
app.use('/v1', routers.loginRouter);
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
		autoIndex: process.env.NODE_ENV === 'development', // only build indexes on development
	};
	connectStatus = await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
} catch (err) {
	console.log('Failed to connect to MongoDB');
	console.log(err);
};
if (connectStatus) {
	console.log("Connection Success!" + process.env.MONGODB_URI);


	console.log("Populating Reasons List");

	await populateReasons();

	console.log("Populating Sample Data");

	await populateSampleUsers();
	await populateSampleEvictions();

	console.log("Opening Ports");

	app.listen(process.env.PORT, () => {
		console.log("Server listening on port:", process.env.PORT);
	});
}

export default app;
