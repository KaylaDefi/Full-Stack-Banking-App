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

// Define Account Schema and Model
const accountSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['Checking', 'Savings'] },
    balance: { type: Number, required: true, default: 0 },
    interestRate: { type: Number, default: 0 },
    accountNumber: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Define User Schema and Model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    accounts: [accountSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Account = mongoose.model('Account', accountSchema);

// Generate a unique account number
const generateAccountNumber = () => {
    return 'ACC' + Math.floor(1000000000 + Math.random() * 9000000000);
};

const create = async (name, email, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with salt rounds of 10
        const user = new User({
            name,
            email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await user.save();
        return user;
    } catch (err) {
        console.error('Error creating user:', err);
        throw err;
    }
};

const addAccountType = async (email, accountType) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.accounts.some(account => account.type === accountType)) {
            throw new Error(`User already has a ${accountType} account`);
        }

        const newAccount = {
            type: accountType,
            balance: 0,
            accountNumber: generateAccountNumber(),
            interestRate: accountType === 'Savings' ? 0.01 : 0 // 1% interest rate for savings
        };

        user.accounts.push(newAccount);
        await user.save();
        return user;
    } catch (err) {
        console.error('Error adding account type:', err);
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

const calculateInterest = async () => {
    try {
        const users = await User.find({ 'accounts.type': 'Savings' });
        for (const user of users) {
            user.accounts.forEach(account => {
                if (account.type === 'Savings') {
                    account.balance += account.balance * account.interestRate;
                }
            });
            await user.save();
        }
        console.log('Interest added to savings accounts');
    } catch (err) {
        console.error('Error adding interest to savings accounts:', err);
        throw err;
    }
};

module.exports = { connectToDatabase, create, findOne, find, generateAccountNumber, deposit, withdraw, all, calculateInterest, addAccountType, User, Account };
