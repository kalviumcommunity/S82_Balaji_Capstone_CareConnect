const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors')
app.use(cors());
const router = require('./routes/index');

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
}));

app.use('/api', router);

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to database'))
  .catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.status(200).send('Hello From Backend!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
