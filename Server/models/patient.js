const mongoose = require('mongoose')

const patientschema = new mongoose.Schema({
    fullname:
    {
        type:String,
        required:true
    },
    email:
    {
        type:String,
        required:true,
        unique:true
    },
    password:
    {
        type:String,
        required:true
    },
    doctors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
      }]
},{timestamps:true})

module.exports = mongoose.model('Patient',patientschema);
