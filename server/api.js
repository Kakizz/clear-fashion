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

app.get('/products/search', async (req, res) => {
  const show = parseInt(req.query.show) || 12;
  const page = parseInt(req.query.page) || 1;
  const brand = req.query.brand;
  const price = req.query.price;
  const days = parseInt(req.query.days);
  const sort = req.query.sort || 'Cheapest';

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
  if (days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateString = cutoffDate.toISOString().slice(0, 10);
    filter.date = { $gte: cutoffDateString };
  }

  let sortOptions = {};
  if (sort === 'Asc price') {
    sortOptions.price = 1;
  } else if (sort === 'Desc price') {
    sortOptions.price = -1;
  } else if (sort === 'Asc date') {
    sortOptions.date = -1;
  } else if (sort === 'Desc date') {
    sortOptions.date = 1;
  }

  const count = await collection.countDocuments(filter);
  const totalPages = Math.ceil(count / show);
  const skip = (page - 1) * show;

  const result = await collection.find(filter).sort(sortOptions).skip(skip).limit(show).toArray();

  res.json({
    currentPage: page,
    totalPages: totalPages,
    totalCount: count,
    data: result
  });
});

app.get('/products/:id', async (req, res) => {
  const productId = req.params.id;

  const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
  const db = client.db(MONGODB_DB_NAME);
  const collection = db.collection('products');

  const result = await collection.find({ _id: ObjectId(productId) }).toArray();

  res.json(result);
});

app.get('/products', async (req, res) => {
  const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
  const db = client.db(MONGODB_DB_NAME);
  const collection = db.collection('products');

  const result = await collection.find({}).toArray();

  res.json(result);
});

app.get('/brands', async (req, res) => {
  const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
  const db = client.db(MONGODB_DB_NAME);
  const collection = db.collection('products');

  const result = await collection.distinct('brand');

  res.json(result);
});