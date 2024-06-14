var express = require('express');
var app     = express();
var cors    = require('cors');
var dal     = require('./dal.js');
const e = require('express');

// used to serve static files from public directory
app.use(express.static('public'));
app.use(cors());
app.use(express.json()); 

dal.connectToDatabase()
   .then(() => {
       console.log('Database is ready');
       // Start express server or other application logic
   })
   .catch(err => {
       console.error('Database connection failed:', err);
       process.exit(1); // Exit the app if the database connection fails
   });

// create user account
app.post('/account/create', function (req, res) {
    const { name, email, password } = req.body; // Assuming you send these in the body of the POST request

    dal.find(email).then(users => {
        if (users.length > 0) {
            res.status(409).send('User already exists');
        } else {
            dal.create(name, email, password).then(user => {
                res.status(201).send(user);
            });
        }
    });
});


// login user 
app.post('/account/login', function (req, res) {
    const { email, password } = req.body;

    dal.findOne(email).then(user => {
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.password === password) {
            res.json({ success: true, message: 'Login successful', user });
        } else {
            res.status(401).json({ success: false, message: 'Login failed: wrong credentials' });
        }
    }).catch(err => {
        res.status(500).json({ success: false, message: 'Server error', error: err });
    });
});



// find user account
app.get('/account/find/:email', function (req, res) {

    dal.find(req.params.email).
        then((user) => {
            console.log(user);
            res.send(user);
    });
});

// find one user by email - alternative to find
app.get('/account/findOne/:email', function (req, res) {

    dal.findOne(req.params.email).
        then((user) => {
            console.log(user);
            res.send(user);
    });
});


// update - deposit/withdraw amount
app.patch('/account/update', function (req, res) {
    const { email, amount } = req.body;

    dal.update(email, Number(amount)).then(response => {
        res.json({ success: true, response });
    }).catch(err => {
        res.status(500).json({ success: false, message: 'Update error', error: err });
    });
});


// all accounts
app.get('/account/all', function (req, res) {

    dal.all().
        then((docs) => {
            console.log(docs);
            res.send(docs);
    });
});

var port = 3000;
app.listen(port);
console.log('Running on port: ' + port);