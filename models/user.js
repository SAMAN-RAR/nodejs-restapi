const mongoose = require("mongoose");

const { Schema } = mongoose;

const required = true;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required,
    },
    password: {
      type: String,
      required,
    },
    name: {
      type: String,
      required,
    },
    status: {
      type: String,
      default: "I am new!",
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
