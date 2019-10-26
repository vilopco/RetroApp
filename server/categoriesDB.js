const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// this will be our data base's data structure 
const DataSchema = new Schema(
  {
    name:String,
    bgColor:String
  },
  { timestamps: true }
);


module.exports = mongoose.model('Categories', DataSchema);