import { Router } from "express";
import Event from "../models/Event.js";

const router = Router();

// Create Event route
router.post("/", async (request, response) => {
  try {
    console.log("Create Event payload:", request.body);  // Debug log on POST payload

    // Explicitly assign createdBy from request body (or fallback to a default or error)
    const eventData = {
      ...request.body,
      createdBy: request.body.createdBy || "unknown", // or handle error if missing
    };

    const newEvent = new Event(eventData);

    const data = await newEvent.save();

    console.log("New Event saved:", data);  // Debug log on successful save
    response.json(data);
  } catch(error) {
    console.log("Error in POST /events:", error);

    if ("name" in error && error.name === "ValidationError")
      return response.status(400).json(error.errors);

    return response.status(500).json(error.errors);
  }
});

// Get all Events route
router.get("/", async (request, response) => {
  try {
    const query = request.query;
    console.log("GET /events with query:", query);

    const data = await Event.find(query);

    console.log(`Found ${data.length} events`);
    response.json(data);
  } catch(error) {
    console.log("Error in GET /events:", error);

    return response.status(500).json(error.errors);
  }
});

// Get a single Event by ID
router.get("/:id", async (request, response) => {
  try {
    const eventId = request.params.id;
    console.log("GET /events/:id with id:", eventId);

    const data = await Event.findById(eventId);

    console.log("Event found:", data);
    response.json(data);
  } catch(error) {
    console.log("Error in GET /events/:id:", error);

    return response.status(500).json(error.errors);
  }
});

// Delete an Event by ID
router.delete("/:id", async (request, response) => {
  try {
    const eventId = request.params.id;
    console.log("DELETE /events/:id with id:", eventId);

    const data = await Event.findByIdAndDelete(eventId);

    console.log("Deleted Event:", data);
    response.json(data);
  } catch(error) {
    console.log("Error in DELETE /events/:id:", error);

    return response.status(500).json(error.errors);
  }
});

// Update an Event by ID
router.put("/:id", async (request, response) => {
  try {
    const eventId = request.params.id;
    const body = request.body;
    console.log(`PUT /events/:id with id: ${eventId} and body:`, body);

    const data = await Event.findByIdAndUpdate(
      eventId,
      {
        $set: {
          createdBy: body.createdBy,
          eventName: body.eventName,
          eventAddress: body.address,
          visable: body.visable,
          eventDate: body.eventDate,
          startTime: body.startTime,
          endTime: body.endTime,
          interests: body.interests // Make sure this matches your model
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    console.log("Updated Event:", data);
    response.json(data);
  } catch(error) {
    console.log("Error in PUT /events/:id:", error);

    if ('name' in error && error.name === 'ValidationError') return response.status(400).json(error.errors);

    return response.status(500).json(error.errors);
  }
});

export default router;
