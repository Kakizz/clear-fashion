const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const { MongoClient, ObjectId } = require('mongodb');
const MONGODB_URI = 'mongodb+srv://KakizzV2:123@cluster0.v3zr9qi.mongodb.net/?retryWrites=true&writeConcern=majority';
const MONGODB_DB_NAME = 'clearfashion';

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);

async function findProductById(productId) {
  const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
  const db = client.db(MONGODB_DB_NAME);
  const collection = db.collection('products');
  let result = await collection.find({ _id: ObjectId(productId) }).toArray();
  return result;
}

app.get('/products/search', async (req, res) => {
  const limit = parseInt(req.query.limit) || 12;
  const brand = req.query.brand;
  const price = req.query.price;

  const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
  const db = client.db(MONGODB_DB_NAME);
  const collection = db.collection('products');

  let filter = {};
  if (brand) {
    filter.brand = brand;
  }
  if (price) {
    filter.price = { $lte: parseInt(price) };
  }

  const result = await collection.find(filter).sort({price: 1}).limit(limit).toArray();
  
  res.json(result);
});

app.get('/brands', async (req, res) => {
  const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
  const db = client.db(MONGODB_DB_NAME);
  const collection = db.collection('products');

  const result = await collection.distinct('brand');
  
  res.send({result: result});
});

app.get('/products/:id', async (req, res) => {
  const productId = req.params.id;
  const product = await findProductById(productId);
  res.json(product);
});
