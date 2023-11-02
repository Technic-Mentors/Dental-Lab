const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
   type:String,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("post", postSchema);
