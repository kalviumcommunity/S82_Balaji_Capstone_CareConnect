const mongoose = require('mongoose');

const addressschema = new mongoose.Schema({
    address:{type:String,require:true}
})

module.exports = mongoose.model('address',addressschema);