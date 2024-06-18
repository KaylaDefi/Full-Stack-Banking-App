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
app.post('/account/create', function (req, res) {
    const { name, email, password } = req.body;
    console.log('Creating user:', { name, email, password });

    dal.find(email).then(users => {
        if (users.length > 0) {
            console.log('User already exists:', email);
            res.status(409).send('User already exists');
        } else {
            dal.create(name, email, password).then(user => {
                console.log('User created:', user);
                res.status(201).send(user);
            });
        }
    }).catch(err => {
        console.error('Error during user creation:', err);
        res.status(500).send('Server error');
    });
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
    console.log('Deposit route called');
    const { email, amount } = req.body;

    if (!email || !amount) {
        return res.status(400).json({ error: 'Email and amount are required.' });
    }

    try {
        const updatedUser = await dal.deposit(email, Number(amount));
        console.log('Deposit result:', updatedUser);
        if (updatedUser) {
            return res.json({ success: true, updatedUser });
        } else {
            return res.status(500).json({ success: false, message: 'Deposit error: user not found or update failed' });
        }
    } catch (err) {
        console.error('Deposit error:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err });
    }
});

app.patch('/account/withdraw', async (req, res) => {
    console.log('Withdraw route called');
    const { email, amount } = req.body;
  
    if (!email || !amount) {
      return res.status(400).json({ error: 'Email and amount are required.' });
    }
  
    try {
      const updatedUser = await dal.withdraw(email, Number(amount));
      console.log('Withdraw result:', updatedUser);
      if (updatedUser) {
        return res.json({ success: true, updatedUser });
      } else {
        return res.status(500).json({ success: false, message: 'Withdraw error: user not found or update failed' });
      }
    } catch (err) {
      console.error('Withdraw error:', err);
      res.status(500).json({ success: false, message: 'Server error', error: err });
    }
  });
  

// All accounts
app.get('/account/all', function (req, res) {
    dal.all().then(docs => {
        console.log('All accounts result:', docs);
        res.send(docs);
    }).catch(err => {
        console.error('Error retrieving all users:', err);
        res.status(500).send('Server error');
    });
});

const port = 3000;
app.listen(port, () => {
    console.log('Running on port:', port);
});

