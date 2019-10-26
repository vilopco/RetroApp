const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// this will be our data base's data structure 
const DataSchema = new Schema(
  {
    name:String,
    category:String,
    bgColor:String,
    totalLikes: {type: Number, default: 0}
  }
);

module.exports = mongoose.model('Cards', DataSchema);