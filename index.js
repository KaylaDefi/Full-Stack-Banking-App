const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dal = require('./dal.js');

// Middleware setup
app.use(express.static('public'));
app.use(cors());
app.use(express.json()); 

// Connect to database
dal.connectToDatabase()
   .then(() => {
       console.log('Database is ready');
       // Start express server or other application logic
   })
   .catch(err => {
       console.error('Database connection failed:', err);
       process.exit(1); // Exit the app if the database connection fails
   });

// Create user account
app.post('/account/create', async (req, res) => {
    const { name, email, password } = req.body;
    console.log('Creating user:', { name, email, password });

    try {
        // Check if user already exists
        const existingUsers = await dal.find(email);
        if (existingUsers.length > 0) {
            console.log('User already exists:', email);
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new dal.User({
            name,
            email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await newUser.save();
        console.log('User created:', newUser);

        // Return success response
        res.status(201).json({ success: true, user: newUser });

    } catch (error) {
        console.error('Error during user creation:', error);
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});

app.post('/account/addtype', async (req, res) => {
    const { email, type } = req.body;
    console.log('Adding account type:', { email, type });

    try {
        const accountNumber = dal.generateAccountNumber();
        const newAccount = {
            type,
            balance: 0,
            interestRate: type === 'Savings' ? 0.02 : 0,
            accountNumber,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const user = await dal.findOne(email);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.accounts.push(newAccount);
        user.updatedAt = new Date();
        await user.save();

        res.status(201).json({ success: true, user });
    } catch (error) {
        console.error('Error creating account type:', error);
        res.status(500).json({ success: false, message: 'Account creation failed', error });
    }
});

// Login user
app.post('/account/login', function (req, res) {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    dal.findOne(email).then(user => {
        if (!user) {
            console.error('Login failed: User not found');
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        console.log('User found for login:', user);
        bcrypt.compare(password, user.password, function(err, result) {
            if (err) {
                console.error('Bcrypt comparison error:', err);
                return res.status(500).json({ success: false, message: 'Server error', error: err });
            }
            if (result) {
                res.json({ success: true, message: 'Login successful', user });
            } else {
                console.error('Login failed: Incorrect password for user', email);
                res.status(401).json({ success: false, message: 'Login failed: wrong credentials' });
            }
        });
    }).catch(err => {
        console.error('Server error during login:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err });
    });
});

// Find user account
app.get('/account/find/:email', function (req, res) {
    const email = req.params.email;
    console.log('Finding user account for:', email);

    dal.find(email).then(user => {
        console.log('Find user result:', user);
        res.send(user);
    }).catch(err => {
        console.error('Error finding user:', err);
        res.status(500).send('Server error');
    });
});

// Find one user by email - alternative to find
app.get('/account/findOne/:email', function (req, res) {
    const email = req.params.email;
    console.log('Finding one user by email:', email);

    dal.findOne(email).then(user => {
        console.log('Find one user result:', user);
        res.send(user);
    }).catch(err => {
        console.error('Error finding user:', err);
        res.status(500).send('Server error');
    });
});

// Update - deposit/withdraw amount
app.patch('/account/update', function (req, res) {
    const { email, amount } = req.body;

    dal.update(email, Number(amount)).then(response => {
        console.log('Update result:', response);
        res.json({ success: true, response });
    }).catch(err => {
        console.error('Update error:', err);
        res.status(500).json({ success: false, message: 'Update error', error: err });
    });
});

app.patch('/account/deposit', async (req, res) => {
    const { email, amount, accountType } = req.body;
    try {
      const user = await dal.findOne(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const account = user.accounts.find(acc => acc.type === accountType);
      if (!account) {
        return res.status(404).json({ error: `${accountType} account not found` });
      }
      account.balance += Number(amount);
      await user.save();
      res.json({ success: true, updatedUser: user });
    } catch (err) {
      console.error('Deposit error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

  app.patch('/account/withdraw', async (req, res) => {
    const { email, amount, accountType } = req.body;
    try {
      const user = await dal.findOne(email);
      const account = user.accounts.find(acc => acc.type === accountType);
      if (account.balance < amount) {
        return res.status(400).json({ success: false, message: 'Insufficient balance' });
      }
      account.balance -= amount;
      user.updatedAt = new Date();
      await user.save();
      res.json({ success: true, updatedUser: user });
    } catch (err) {
      console.error('Withdraw error:', err);
      res.status(500).json({ success: false, message: 'Server error', error: err });
    }
  });

// All accounts
app.get('/account/all', async (req, res) => {
    try {
        const users = await dal.all();
        console.log('All accounts result:', users);
        res.status(200).json(users);
    } catch (error) {
        console.error('Error retrieving all users:', error);
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log('Running on port:', port);
});
