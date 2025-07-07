
const express = require('express');
const app = express();
const router = require('./routes/index');
const cors = require('cors');
require('dotenv').config();

const allowedOrigins = [
  'http://localhost:5173',
  'https://extraordinary-kitsune-f05960.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS Not Allowed"));
    }
  },
  credentials: true
}));


app.use(express.json());
app.use('/api', router);

app.use('/uploads',express.static('uploads'));
app.get('/', (req, res) => {
  res.status(200).send('Hello From Backend!');
});


module.exports = app;

