const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// SmartDBUsers
// QtncYhZ7#5bYV-m
// IF Password have special character use %23 instead of #
const uri = "mongodb+srv://SmartDBUsers:QtncYhZ7%235bYV-m@cluster0.zt464dg.mongodb.net/?appName=Cluster0";

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
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();

        const db = client.db("smart_db");
        const productsCollection = db.collection("products");
        const bidsCollection = db.collection('bids');
        const usersCollection = db.collection('users');

        // ================= USERS ROUTES =================
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = req.body.email;

            const query = { email: email };
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'User already exists' });
            }

            const result = await usersCollection.insertOne(newUser);
            res.send(result);
        });

        // ================= PRODUCTS ROUTES =================
        // Get all products (supports ?email= to filter user's products in MyProducts)
        app.get("/products", async (req, res) => {
            const email = req.query.email;
            const query = {};
            if (email) {
                // Match either email or seller_email
                query.$or = [{ email: email }, { seller_email: email }];
            }

            const cursor = productsCollection.find(query).sort({ created_at: -1 });
            const products = await cursor.toArray();
            res.send(products);
        });

        // Get latest 6 products for homepage
        app.get('/latest-products', async (req, res) => {
            const cursor = productsCollection.find().sort({ created_at: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        });

        // Get single product by ID
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.send(result);
        });

        // Create a new product (POST)
        app.post("/products", async (req, res) => {
            const newProduct = req.body;
            if (!newProduct.created_at) {
                newProduct.created_at = new Date().toISOString();
            }
            if (!newProduct.status) {
                newProduct.status = 'pending';
            }
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        });

        // Delete product
        app.delete("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        });

        // Update product (supports Edit & Make Sold)
        app.patch("/products/:id", async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const query = { _id: new ObjectId(id) };
            const update = {
                $set: updatedProduct
            };
            const result = await productsCollection.updateOne(query, update);
            res.send(result);
        });

        // ================= BIDS ROUTES =================
        // Get bids (supports ?email= for logged in user's bids)
        app.get('/bids', async (req, res) => {
            const email = req.query.email;
            const query = {};
            if (email) {
                query.buyer_email = email;
            }
            const cursor = bidsCollection.find(query).sort({ bid_price: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });

        // Get bids for a specific product by product ID
        app.get('/bids/byProduct/:productID', async (req, res) => {
            const productID = req.params.productID;
            const query = { productId: productID };
            const cursor = bidsCollection.find(query).sort({ bid_price: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });

        // Post a new bid
        app.post('/bids', async (req, res) => {
            const newBid = req.body;
            if (!newBid.created_at) {
                newBid.created_at = new Date().toISOString();
            }
            const result = await bidsCollection.insertOne(newBid);
            res.send(result);
        });

        // Get bid by ID
        app.get('/bids/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bidsCollection.findOne(query);
            res.send(result);
        });

        // Delete bid
        app.delete('/bids/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bidsCollection.deleteOne(query);
            res.send(result);
        });

        // Patch bid (update status like accepted / rejected)
        app.patch('/bids/:id', async (req, res) => {
            const id = req.params.id;
            const updatedBid = req.body;
            const query = { _id: new ObjectId(id) };
            const update = {
                $set: updatedBid
            };
            const result = await bidsCollection.updateOne(query, update);
            res.send(result);
        });

        // Confirm MongoDB connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Keep connection alive
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Smart Deals Server is running!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
