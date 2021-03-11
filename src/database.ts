import { MongoClient, Db } from 'mongodb';

let database: Db;
let connection: MongoClient;

const connectDatabase = (callback: (err: Error) => void): void => {
  MongoClient.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err, client) => {
      database = client.db();
      connection = client;
      callback(err);
    }
  );
};

const getDatabase = (): Db => {
  return database;
};

const closeDatabase = (callback: (err: Error) => void): void => {
  console.log('closing connections');
  connection.close(true, (err) => {
    database = null;
    connection = null;
    callback(err);
  });
};

export { getDatabase, connectDatabase, closeDatabase };
