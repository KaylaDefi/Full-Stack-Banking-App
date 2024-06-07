const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';

// connect to MongoDB
MongoClient.connect(url, { useUnifiedTopology: true }, function(err, client) {
  if (err) {
    console.error('Failed to connect to MongoDB:', err);
    return;
  }

  console.log('Connected successfully to server');

  // database Name
  const dbName = 'myproject';
  const db = client.db(dbName);

  // new user
  var name = 'user' + Math.floor(Math.random() * 10000);
  var email = name + '@mit.edu';

  // insert into customer table
  var collection = db.collection('customers');
  var doc = { name, email };
  collection.insertOne(doc, { writeConcern: { w: 1 } }, function(err, result) {
    if (err) {
      console.error('Error inserting document:', err);
    } else {
      console.log('Document inserted successfully');
    }
  });

  // fetch customers
  var customers = db
    .collection('customers')
    .find()
    .toArray(function(err, docs) {
      if (err) {
        console.error('Error fetching customers:', err);
      } else {
        console.log('Collection:', docs);
      }

      // clean up
      client.close();
    });
});

