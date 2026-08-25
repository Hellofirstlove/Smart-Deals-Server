const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000

//Midelware
app.use(cors())
app.use(express.json())

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const database = client.db("smart_db");
        const productsCollection = database.collection("products");


        // Get
        app.get("/products", async (req, res) => {
            const cursor = productsCollection.find();
            const products = await cursor.toArray();
            res.send(products);
        })

        // Get by ID
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.send(result);
        })

        // POST
        app.post("/products", async (req, res) => {
            const newProduct = req.body; 
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        })
            

        // Delete
        app.delete("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        })

        //Patch
        app.patch("/products/:id", async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const query = { _id: new ObjectId(id) };
            const update = {
                $set: {
                    name: updatedProduct.name,
                    price: updatedProduct.price,
                }
            };
            const result = await productsCollection.updateOne(query, update);
            res.send(result);
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
    res.send('Hello World!')
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})