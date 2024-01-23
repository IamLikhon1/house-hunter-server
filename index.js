const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require("dotenv").config();

// middleware

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.snwbd1q.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const userCollection = client.db('house-hunter').collection('user');
        const houseHunterCollection = client.db('house-hunter').collection('hunter')
        const bookRentHouseCollection = client.db('house-hunter').collection('rent')

        // post api for users
        app.post('/usersPost', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'User Already Have Exists' })
            }
            const result = await userCollection.insertOne(user)
            res.send(result)
        });

        // get api for users
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        });

        // post api owner send data
        app.post('/postHouseData', async (req, res) => {
            const postData = req.body;
            const result = await houseHunterCollection.insertOne(postData);
            res.send(result)
        });

        // get all owner data
        app.get('/getAllOwnerData', async (req, res) => {
            const result = await houseHunterCollection.find().toArray();
            res.send(result)
        });

        // search api
        app.get('/getAllSearchData', async (req, res) => {
            const search = req.query.search
            const sort = req.query.sort
            const query = { name: { $regex: `${search}`, $options: 'i' } };
            const sortOptions = {
                sort: {
                    'rent': sort === 'asc' ? 1 : -1
                }
            }
            const result = await houseHunterCollection.find(query, sortOptions).toArray();
            res.send(result)
        });
        // get single owner posted data
        app.get('/getAllOwnerData/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await houseHunterCollection.findOne(query);
            res.send(result)
        })


        // delete api for owners data
        app.delete('/deleteData/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await houseHunterCollection.deleteOne(query);
            res.send(result)
        })

        // update api for owners data
        app.put('/updateHouses/:id', async (req, res) => {
            const id = req.params.id;
            const update = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const data = {
                $set: {
                    name: update.name,
                    address: update.address,
                    city: update.city,
                    bedrooms: update.bedrooms,
                    bathrooms: update.bathrooms,
                    size: update.size,
                    picture: update.picture,
                    date: update.date,
                    rent: update.rent,
                    number: update.number,
                    description: update.description,
                }
            }
            const result = await houseHunterCollection.updateOne(filter, data, options);
            res.send(result)
        })

        // post api renter send data
        app.post('/postRenterData', async (req, res) => {
            const postData = req.body;
            const result = await bookRentHouseCollection.insertOne(postData);
            res.send(result)
        });

        // get all renter data
        app.get('/getAllRenterData', async (req, res) => {
            const result = await bookRentHouseCollection.find().toArray();
            res.send(result)
        });

        // delete api for renters data
        app.delete('/deleteDataRenter/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookRentHouseCollection.deleteOne(query);
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('House-Hunter server Is running')
})
app.listen(port, () => {
    console.log(`House-Hunter is server running on port: ${port}`)
})