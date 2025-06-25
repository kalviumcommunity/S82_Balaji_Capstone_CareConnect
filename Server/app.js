
const express = require('express');
const app = express();
const router = require('./routes/index');
const cors = require('cors');
require('dotenv').config();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials:true
}));

app.use(express.json());
app.use('/api', router);

app.use('/uploads',express.static('uploads'));
app.get('/', (req, res) => {
  res.status(200).send('Hello From Backend!');
});


module.exports = app;

