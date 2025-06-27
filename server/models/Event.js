import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  eventDate: {
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
