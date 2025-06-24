import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ["public", "private"],
    default: "public"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
});

const Event = mongoose.model("Event", eventSchema);
export default Event;
