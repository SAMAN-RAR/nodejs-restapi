const mongoose = require('mongoose');
const { Schema } = mongoose;

const required = true;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required,
    },
    imageUrl: {
      type: String,
      required,
    },
    content: {
      type: String,
      required,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
