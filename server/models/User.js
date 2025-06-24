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
    match: /^[A-Za-z0-9-@-_-!-+ ]*$/,
    unique: true
  },
  startingAddress: {
    type: String,
    validate: /^[A-Za-z0-9 ]*$/
  },

  interests: [String]
});

const User = mongoose.model("User", userSchema);
export default User;

