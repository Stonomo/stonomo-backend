import { createServer } from 'http';
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
import { getTokenSecret } from './lib/jwtHelper.js';
import { connectToDatabase } from './lib/setup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';
const port = process.env.PORT;

console.log("Starting Express");

let app = express();

console.log("Configuring Express");

app.use(logger('dev'));
app.use(requestMethods);
app.use(cors({
	origin: ['http://localhost:3000', 'http://localhost', 'https://stonomo.com'],
	credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(getTokenSecret()));
app.use(express.static(join(__dirname, 'public')));

app.get("/status", (req, res) => {
	//TODO: add health check logic
	const status = {
		message: 'Running',
		dbConnection: mongoose.connection.readyState
	}
	res.send(status);
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

connectToDatabase();

console.log("Opening Ports");
const server = createServer(app);

server.listen(port || 3000, () => {
	console.log("Server listening on port:", port);
});
// while (mongoose.connection.readyState !== 1) {
// 	//TODO: set health to bad db connection-itis
// }

export default app;
