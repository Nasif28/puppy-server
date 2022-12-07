const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.adcng.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('puppy');
        const breedsCollection = database.collection('breeds');
        const orderCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const reviewCollection = database.collection('reviews');

        //GET BREEDS API
        app.get('/breeds', async (req, res) => {
            const cursor = breedsCollection.find({});
            const breeds = await cursor.toArray();
            res.send(breeds);
        });

        // GET SINGLE BREED BY ID
        app.get('/breeds/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const places = await breedsCollection.findOne(query);
            res.json(places);
        })

        // ADD ORDER API
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        });

        // ADD USERS
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // ADD USER GOOGLE
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        //CHECK ADMIN
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // MAKE ADMIN PUT API
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // POST API - ADD NEW BREED
        app.post('/breeds', async (req, res) => {
            const addBreed = req.body;
            const result = await breedsCollection.insertOne(addBreed);
            res.json(result);
        });

        // DELETE MANAGE BREEDS API
        app.delete("/manageBreeds/:id", async (req, res) => {
            console.log(req.params.id);
            const result = await breedsCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });

        // GET ALL ORDER
        app.get("/manageOrder", async (req, res) => {
            const result = await orderCollection.find({}).toArray();
            res.send(result);
        });

        // DELETE MANAGEORDER API
        app.delete("/deleteManageOrder/:id", async (req, res) => {
            console.log(req.params.id);
            const result = await orderCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });

        // GET MYORDER
        app.get("/myOrder/:email", async (req, res) => {
            const result = await orderCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });

        // DELETE MYORDER API
        app.delete("/deleteMyOrder/:id", async (req, res) => {
            const result = await orderCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });

        // PUT UPDATE STATUS API
        app.put("/updateStatus", async (req, res) => {
            const id = req.body.id;
            const query = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    'status': 'Approved'
                },
            };
            const service = await orderCollection.updateOne(query, updateDoc, options);
            res.send(service);
        });

        // ADD REVIEW API
        app.post('/reviewAdd', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        });

        // GET ALL REVIEW
        app.get("/reviewAdd", async (req, res) => {
            const result = await reviewCollection.find({}).toArray();
            res.send(result);
        });
    }

    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('PUPPY server is running');
});

app.listen(port, () => {
    console.log('Server running at port', port);
})