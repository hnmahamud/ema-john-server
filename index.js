const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6jia9zl.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect((err) => {
      if (err) {
        console.error(err);
        return;
      }
    });

    const database = client.db("emaJohnDB");
    const productCollection = database.collection("products");

    app.get("/products", async (req, res) => {
      const currentPage = parseInt(req.query.currentPage) || 0;
      const itemsPerPage = parseInt(req.query.itemsPerPage) || 10;

      const skip = currentPage * itemsPerPage;
      const result = await productCollection
        .find()
        .skip(skip)
        .limit(itemsPerPage)
        .toArray();

      res.send(result);
    });

    app.get("/totalProducts", async (req, res) => {
      const result = await productCollection.estimatedDocumentCount();
      res.send({ totalProducts: result });
    });

    app.post("/productsByIds", async (req, res) => {
      const ids = req.body.ids;
      const objectIds = ids.map((id) => new ObjectId(id));
      const data = await productCollection
        .find({ _id: { $in: objectIds } })
        .toArray();

      res.send(data);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running..");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
