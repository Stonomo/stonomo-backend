export const PORT = process.env.PORT || 3000;

// mongodb://MONGO_URI:MONGO_PORT/MONGO_DB
export const MONGO_URI = 'localhost';
export const MONGO_PORT = 27017;
export const MONGO_DB = 'stonomo'
export const MONGO_CONN_STR = 'mongodb://' + MONGO_URI + ':' + MONGO_PORT + '/' + MONGO_DB