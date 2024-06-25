const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dal = require('./dal.js');
const { authenticator } = require('otplib');

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
    const { name, email, password, accountType } = req.body;
    console.log('Creating user:', { name, email, password, accountType });

    try {
        const existingUsers = await dal.find(email);
        if (existingUsers.length > 0) {
            console.log('User already exists:', email);
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        const { user, qrCodeDataUrl } = await dal.create(name, email, password, accountType);
        console.log('User created:', user);

        res.status(201).json({ success: true, user, qrCodeDataUrl });

    } catch (error) {
        console.error('Error during user creation:', error);
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});

app.post('/account/addtype', async (req, res) => {
    const { email, type } = req.body;
    console.log('Adding account type:', { email, type });

    try {
        const user = await dal.addAccountType(email, type);
        res.status(201).json({ success: true, user });
    } catch (error) {
        console.error('Error creating account type:', error);
        res.status(500).json({ success: false, message: 'Account creation failed', error });
    }
});

// Login user
app.post('/account/login', async (req, res) => {
    const { email, password, totpCode } = req.body;  // Expect TOTP code in the request body
    console.log('Login attempt for:', email);

    try {
        const user = await dal.findOne(email);
        if (!user) {
            console.error('Login failed: User not found');
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        console.log('User found for login:', user);

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.error('Login failed: Incorrect password for user', email);
            return res.status(401).json({ success: false, message: 'Login failed: wrong credentials' });
        }

        // Verify TOTP code
        console.log('Verifying TOTP code:', totpCode);
        const isValid = authenticator.check(totpCode, user.totpSecret);
        console.log('TOTP validation result:', isValid);
        if (!isValid) {
            console.error('Login failed: Invalid TOTP code for user', email);
            return res.status(401).json({ success: false, message: 'Login failed: Invalid TOTP code' });
        }

        res.json({ success: true, message: 'Login successful', user });
    } catch (err) {
        console.error('Server error during login:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err });
    }
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
      const account = user.accounts.find(acc => acc.type === accountType);
      if (!account) {
        return res.status(404).json({ success: false, message: 'Account not found' });
      }
      account.balance += amount;
      user.updatedAt = new Date();
  
      // Add transaction
      user.transactions.push({
        type: 'Deposit',
        amount,
        currency: 'USD', // Assuming USD for now
        date: new Date()
      });
  
      await user.save();
      res.json({ success: true, updatedUser: user });
    } catch (err) {
      console.error('Deposit error:', err);
      res.status(500).json({ success: false, message: 'Server error', error: err });
    }
  });

  app.patch('/account/withdraw', async (req, res) => {
    const { email, amount, accountType } = req.body;
    try {
      const user = await dal.findOne(email);
      const account = user.accounts.find(acc => acc.type === accountType);
      if (!account) {
        return res.status(404).json({ success: false, message: 'Account not found' });
      }
      if (account.balance < amount) {
        return res.status(400).json({ success: false, message: 'Insufficient balance' });
      }
      account.balance -= amount;
      user.updatedAt = new Date();
  
      // Add transaction
      user.transactions.push({
        type: 'Withdraw',
        amount,
        currency: 'USD', // Assuming USD for now
        date: new Date()
      });
  
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
