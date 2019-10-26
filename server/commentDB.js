const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// this will be our data base's data structure 
const DataSchema = new Schema(
  {
    id:String,
    id_card:String,
    content:String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comments', DataSchema);