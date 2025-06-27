
import { Router } from  "express";
import Event from "../models/Event.js";

const router = Router();

// Create Event route
router.post("/", async (request, response) => {
  try {
    const newEvent = new Event(request.body);

    const data = await newEvent.save();

    response.json(data);
  } catch(error) {
    // Output error to the console incase it fails to send in response
    console.log(error);

    if ("name" in error && error.name === "ValidationError") return response.status(400).json(error.errors);

    return response.status(500).json(error.errors);
  }
});

// Get all Event route  http://localhost:3000/events

router.get("/", async (request, response) => {
  try {
    // Store the query params into a JavaScript Object
    const query = request.query; // Defaults to an empty object {}

    const data = await Event.find(query);

    response.json(data);
  } catch(error) {
    // Output error to the console incase it fails to send in response
    console.log(error);

    return response.status(500).json(error.errors);
  }
});

// Get a single user by ID http://localhost:3000/users/{id hash}
router.get("/:id", async (request, response) => {
  try {
    const data = await Event.findById(request.params.id);

    response.json(data);
  } catch(error) {
    // Output error to the console incase it fails to send in response
    console.log(error);

    return response.status(500).json(error.errors)
  }
});

// Delete a Event by ID
router.delete("/:id", async (request, response) => {
  try {
    const data = await Event.findByIdAndDelete(request.params.id);

    response.json(data);
  } catch(error) {
    // Output error to the console incase it fails to send in response
    console.log(error);

    return response.status(500).json(error.errors);
  }
});

// Update a single Event by ID
router.put("/:id", async (request, response) => {
  try {
    const body = request.body;

    const data = await Event.findByIdAndUpdate(
      request.params.id,
      {
        $set: {
          eventName: body.eventName,
          address: body.address,
          startTime: body.startTime,
          endTime: body.endTime,
          interestsFlag: body.interests
        }
      },
      {
        //tells mongoDB to return the new info
        new: true,
        runValidators: true
      }
    );

    response.json(data);
  } catch(error) {
    // Output error to the console incase it fails to send in response
    console.log(error);

    if ('name' in error && error.name === 'ValidationError') return response.status(400).json(error.errors);

    return response.status(500).json(error.errors);
  }
});

export default router;
