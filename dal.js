const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
let db = null;

// Function to connect to the database
function connectToDatabase() {
    return MongoClient.connect(url, { useUnifiedTopology: true })
        .then(client => {
            console.log("Connected successfully to db server");
            db = client.db('myproject');
        })
        .catch(err => {
            console.error("Failed to connect to MongoDB:", err);
            throw err; // Rethrow or handle error appropriately
        });
}

// Ensures that db is accessible
function getDb() {
    if (!db) {
        throw new Error('Db has not been initialized. Please call connectToDatabase first.');
    }
    return db;
}

// Function to create a user account
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


// Function to find users by email
function find(email) {
    const collection = getDb().collection('users');
    return collection.find({ email: email }).toArray()
        .catch(err => {
            console.error('Error fetching users:', err);
            throw err;
        });
}

// Function to find a single user by email
function findOne(email) {
    const collection = getDb().collection('users');
    return collection.findOne({ email: email })
        .catch(err => {
            console.error('Error fetching user:', err);
            throw err;
        });
}

// Function to update a user's balance
function update(email, amount) {
    const collection = getDb().collection('users');
    return collection.findOneAndUpdate(
            { email: email },
            { $inc: { balance: amount } },
            { returnDocument: 'after' }  // Ensures that the updated document is returned
        )
        .then(result => result.value) // Return the updated document
        .catch(err => {
            console.error('Error updating user:', err);
            throw err;
        });
}

// Function to retrieve all users
function all() {
    const collection = getDb().collection('users');
    return collection.find({}).toArray()
        .catch(err => {
            console.error('Error retrieving all users:', err);
            throw err;
        });
}

module.exports = { connectToDatabase, getDb, create, findOne, find, update, all };
