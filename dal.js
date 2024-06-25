require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const uri = process.env.MONGODB_URI;
const { authenticator } = require('otplib');
const QRCode = require('qrcode');

const connectToDatabase = async () => {
    try {
        await mongoose.connect(uri);
        console.log("Connected successfully to db server");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        throw err;
    }
};

// Transaction Schema and Model
const transactionSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['Deposit', 'Withdraw', 'Swap', 'Transfer Out', 'Transfer In'] },
    amount: { type: Number, required: true },
    currency: { type: String, required: true }, // USD, BTC, etc.
    date: { type: Date, default: Date.now }
});

const generateAccountNumber = () => {
    return 'ACC' + Math.floor(1000000000 + Math.random() * 9000000000);
};

// Account Schema and Model
const accountSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['Checking', 'Savings', 'Crypto'] },
    balance: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: 'USD' }, // USD, BTC, etc.
    accountNumber: { type: String, required: true, unique: true, default: generateAccountNumber },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// User Schema and Model
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    totpSecret: { type: String, required: false }, 
    accounts: [accountSchema],
    transactions: [transactionSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Account = mongoose.model('Account', accountSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

const create = async (name, email, password, accountType) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10); 
        const totpSecret = authenticator.generateSecret(); 
        const user = new User({
            name,
            email,
            password: hashedPassword,
            totpSecret,  // Save TOTP secret
            createdAt: new Date(),
            updatedAt: new Date(),
            accounts: [
                {
                    type: accountType,
                    balance: 0,
                    currency: 'USD',
                    accountNumber: generateAccountNumber(), 
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ]
        });

        await user.save();

        // Generate QR code for TOTP
        const totpUri = authenticator.keyuri(email, 'Wild Frontier Bank', totpSecret);
        const qrCodeDataUrl = await QRCode.toDataURL(totpUri);

        return { user, qrCodeDataUrl };
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
            createdAt: new Date(),
            updatedAt: new Date()
        };

        user.accounts.push(newAccount);
        user.updatedAt = new Date();
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
        console.log('findOne result:', user); 
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

const findOneByAccountNumber = async (accountNumber) => {
    try {
        return await User.findOne({ 'accounts.accountNumber': accountNumber }).exec();
    } catch (err) {
        console.error('Error fetching user by account number:', err);
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

module.exports = { connectToDatabase, create, findOne, find, generateAccountNumber, deposit, withdraw, findOneByAccountNumber, all, calculateInterest, addAccountType, User, Account, Transaction };
