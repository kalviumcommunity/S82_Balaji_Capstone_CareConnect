const express = require('express');
const app = express()
const mongoose = require('mongoose');
app.use(express.json())
require('dotenv').config();
const PORT = process.env.PORT

const bcrypt = require('bcrypt');
const saltRounds = 10;

patientSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});


mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log('connected to database'))
.catch((err)=>console.log(err));
app.get('/',(req,res)=>{
    res.status(200).send('Hello From Backend!');
})

app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT}`)
})