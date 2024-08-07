const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dal = require('./dal.js');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const { User } = require('./dal'); 

app.use(express.static('public'));
app.use(cors());
app.use(express.json()); 

dal.connectToDatabase()
   .then(() => {
       console.log('Database is ready');
   })
   .catch(err => {
       console.error('Database connection failed:', err);
       process.exit(1);
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

        const user = await dal.create(name, email, password, accountType);
        console.log('User created:', user);

        res.status(201).json({ success: true, user });

    } catch (error) {
        console.error('Error during user creation:', error);
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});

// Enable 2FA
app.post('/account/enable-2fa', async (req, res) => {
    const { email } = req.body;
    try {
        const secret = authenticator.generateSecret();
        const updatedUser = await dal.User.findOneAndUpdate(
            { email },
            { totpSecret: secret, twoFactorEnabled: true },
            { new: true }
        );
        const uri = authenticator.keyuri(email, 'Wild Frontier Bank', secret);
        const qrCodeDataUrl = await QRCode.toDataURL(uri);
        res.json({ qrCodeDataUrl, totpSecret: secret });
    } catch (err) {
        console.error('Failed to enable 2FA:', err);
        res.status(500).json({ message: 'Failed to enable 2FA' });
    }
});

// Disable 2FA
app.post('/account/disable-2fa', async (req, res) => {
    const { email } = req.body;
    try {
        await dal.User.findOneAndUpdate(
            { email },
            { $unset: { totpSecret: "" }, twoFactorEnabled: false },
            { new: true }
        );
        res.json({ message: '2FA disabled' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to disable 2FA' });
    }
});

// Login user
app.post('/account/login', async (req, res) => {
    const { email, password } = req.body;  
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

        console.log('Password match for user:', email);

        // If 2FA is enabled, notify the client to prompt for the TOTP code
        if (user.twoFactorEnabled) {
            console.log('User has 2FA enabled:', email);
            return res.json({ success: true, user, requiresTotp: true });
        }

        res.json({ success: true, message: 'Login successful', user });
    } catch (err) {
        console.error('Server error during login:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err });
    }
});

// Verify TOTP code
app.post('/account/verify-totp', async (req, res) => {
    const { email, totpCode } = req.body;
    console.log('Verifying TOTP code for email:', email);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.error('User not found for TOTP verification');
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isValid = authenticator.check(totpCode, user.totpSecret);
        console.log('TOTP validation result for user:', isValid);

        if (!isValid) {
            console.error('Invalid TOTP code for user:', email);
            return res.status(401).json({ success: false, message: 'Invalid TOTP code' });
        }

        res.json({ success: true, message: 'TOTP verification successful', user });
    } catch (err) {
        console.error('Server error during TOTP verification:', err);
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

  app.post('/account/transfer', async (req, res) => {
    const { fromEmail, fromAccountType, toAccountNumber, amount } = req.body;

    try {
        const fromUser = await dal.findOne(fromEmail);
        const toUser = await dal.findOneByAccountNumber(toAccountNumber);

        if (!fromUser || !toUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const fromAccount = fromUser.accounts.find(acc => acc.type === fromAccountType);
        const toAccount = toUser.accounts.find(acc => acc.accountNumber === toAccountNumber);

        if (!fromAccount || !toAccount) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }

        if (fromAccount.balance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient funds' });
        }

        fromAccount.balance -= amount;
        toAccount.balance += amount;

        // Create transaction records
        fromUser.transactions.push({
            type: 'Transfer Out',
            amount: amount,
            currency: fromAccount.currency,
            date: new Date(),
            toAccountNumber: toAccountNumber
        });

        toUser.transactions.push({
            type: 'Transfer In',
            amount: amount,
            currency: toAccount.currency,
            date: new Date(),
            fromAccountNumber: fromAccount.accountNumber
        });

        await fromUser.save();
        await toUser.save();

        res.status(200).json({ success: true, message: 'Transfer successful' });
    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({ success: false, message: 'Server error', error });
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
