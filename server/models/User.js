import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    match: /^[A-Za-z0-9 ]*$/,
    unique: true
  },
   email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  startingAddress: {
    type: String,

  },

  interests: [String],

  latitude: Number,

  longitude: Number
});

const User = mongoose.model("User", userSchema);
export default User;

