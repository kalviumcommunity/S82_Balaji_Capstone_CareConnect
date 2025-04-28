const express = require('express');
const app = express()
const mongoose = require('mongoose');
app.use(express.json())
require('dotenv').config();
const PORT = process.env.PORT

app.get('/',(req,res)=>{
    res.status(200).send('Hello From Backend!');
})

app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT}`)
})