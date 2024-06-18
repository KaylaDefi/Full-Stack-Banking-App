require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const uri = process.env.MONGODB_URI;

// Connect to the database
const connectToDatabase = async () => {
    try {
        await mongoose.connect(uri);
        console.log("Connected successfully to db server");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        throw err;
    }
};

// Define User Schema and Model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Database operations using Mongoose models
const create = async (name, email, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with salt rounds of 10
        const user = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            balance: 0,
            createdAt: new Date(), 
            updatedAt: new Date() 
        });
        return await user.save();
    } catch (err) {
        console.error('Error inserting document:', err);
        throw err;
    }
};

const find = async (email) => {
    try {
        return await User.find({ email }).exec();
    } catch (err) {
        console.error('Error fetching users:', err);
        throw err;
    }
};

const findOne = async (email) => {
    try {
        console.log('findOne called with email:', email);
        const user = await User.findOne({ email }).exec();
        console.log('findOne result:', user); // Log the result
        return user;
    } catch (err) {
        console.error('Error fetching user:', err);
        throw err;
    }
};

const update = async (email, amount) => {
    try {
        const user = await User.findOneAndUpdate(
            { email },
            { $inc: { balance: amount }, $set: { updatedAt: new Date() } },
            { new: true }
        ).exec();
        return user;
    } catch (err) {
        console.error('Error updating user:', err);
        throw err;
    }
};

const deposit = async (email, amount) => {
    try {
        const user = await User.findOneAndUpdate(
            { email },
            { $inc: { balance: amount }, $set: { updatedAt: new Date() } },
            { new: true }
        );
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (err) {
        console.error('Error processing deposit:', err);
        throw err;
    }
};

const withdraw = async (email, amount) => {
    try {
        const user = await User.findOneAndUpdate(
            { email },
            { $inc: { balance: -amount }, $set: { updatedAt: new Date() } },
            { new: true }
        ).exec();
        console.log('Withdraw result:', user);
        return user;
    } catch (err) {
        console.error('Error processing withdraw:', err);
        throw err;
    }
};

const all = async () => {
    try {
        return await User.find({}).exec();
    } catch (err) {
        console.error('Error retrieving all users:', err);
        throw err;
    }
};

module.exports = { connectToDatabase, create, findOne, find, update, deposit, withdraw, all, User };
