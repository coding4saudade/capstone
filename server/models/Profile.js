import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    match: /^[A-Za-z0-9 ]*$/,
    unique: true
  },
  interests: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;

