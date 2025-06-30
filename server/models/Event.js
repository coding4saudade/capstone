import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },


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
  address: {
    type: String,
    required: true
  },
  visable: {
    type: String,
    enum: ["public", "private"],
    default: "public"
  },
  startTime: {
    type: String,

  },
  endTime: {
    type: String,

  },
  interests: [String]

});

const Event = mongoose.model("Event", eventSchema);
export default Event;

