import createError from 'http-errors';
import express from 'express';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import lessMiddleware from 'less-middleware';
import logger from 'morgan';
import mongoose from 'mongoose';

import { PORT, MONGO_CONN_STR } from './config.js';

import * as routers from './routes.js';
import { populateReasons } from './models/Reason.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting Express");

var app = express();

console.log("Configuring Express");

// view engine setup

app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(join(__dirname, 'public')));
app.use(express.static(join(__dirname, 'public')));

app.get("/status", (req, res) => {

	res.send({ status: 'Running' });
});

console.log("Adding Routes");

app.use('/search', routers.searchRouter);
app.use('/user', routers.userRouter);
app.use('/reason', routers.reasonRouter);
app.use('/eviction', routers.evictionRouter);
app.use('/tc', routers.testClientRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

console.log("Connecting to Database");

mongoose.connect(MONGO_CONN_STR).then(console.log('Connection success!')).catch(err => {
	console.log('Failed to connect to MongoDB');
	console.log(err);
});

console.log("Populating Reasons List");

await populateReasons();

console.log("Opening Ports");

app.listen(PORT, () => {
	console.log("Server listening on port:", PORT);
});

export default app;
