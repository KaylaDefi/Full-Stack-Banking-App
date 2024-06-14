require('dotenv').config();
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI; 
let db = null;

function connectToDatabase() {
    return MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(client => {
            console.log("Connected successfully to db server");
            db = client.db();
        })
        .catch(err => {
            console.error("Failed to connect to MongoDB:", err);
            throw err; 
        });
}

function getDb() {
    if (!db) {
        throw new Error('Db has not been initialized. Please call connectToDatabase first.');
    }
    return db;
}

function create(name, email, password) {
    const collection = getDb().collection('users');
    const doc = { name, email, password, balance: 0 };
    return collection.insertOne(doc)
        .then(result => {
            return collection.findOne({ _id: result.insertedId });
        })
        .catch(err => {
            console.error('Error inserting document:', err);
            throw err;
        });
}

function find(email) {
    const collection = getDb().collection('users');
    return collection.find({ email: email }).toArray()
        .catch(err => {
            console.error('Error fetching users:', err);
            throw err;
        });
}

function findOne(email) {
    const collection = getDb().collection('users');
    return collection.findOne({ email: email })
        .catch(err => {
            console.error('Error fetching user:', err);
            throw err;
        });
}

function update(email, amount) {
    const collection = getDb().collection('users');
    return collection.findOneAndUpdate(
            { email: email },
            { $inc: { balance: amount } },
            { returnDocument: 'after' }  
        )
        .then(result => result.value) 
        .catch(err => {
            console.error('Error updating user:', err);
            throw err;
        });
}

function all() {
    const collection = getDb().collection('users');
    return collection.find({}).toArray()
        .catch(err => {
            console.error('Error retrieving all users:', err);
            throw err;
        });
}

module.exports = { connectToDatabase, getDb, create, findOne, find, update, all };
