import { MongoClient, Db, MongoError } from 'mongodb';

let database: Db;

const connectDatabase = (callback: (err: MongoError) => void): void => {
  MongoClient.connect(process.env.DB_CONNECTION_STRING, function (err, client) {
    database = client.db('thumbnailDB');
    callback(err);
  });
};

const getDatabase = (): Db => {
  return database;
};

export { getDatabase, connectDatabase };
