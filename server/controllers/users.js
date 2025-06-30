
import { Router } from  "express";
import User from "../models/User.js";

const router = Router();

// Create User route
router.post("/", async (request, response) => {
  console.log("route invoked");
  try {
    const newUser = new User(request.body);

    const data = await newUser.save();

    response.json(data);
  } catch(error) {
    // Output error to the console incase it fails to send in response
    console.log(error);

    if ("name" in error && error.name === "ValidationError") return response.status(400).json(error.errors);

    return response.status(500).json(error.errors);
  }
});
// GET a user by username
router.get("/username/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by username:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all user route  http://localhost:3000/users

router.get("/", async (request, response) => {
  try {
    // Store the query params into a JavaScript Object
    const query = request.query; // Defaults to an empty object {}

    const data = await User.find(query);

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
    const data = await User.findById(request.params.id);

    response.json(data);
  } catch(error) {
    // Output error to the console incase it fails to send in response
    console.log(error);

    return response.status(500).json(error.errors)
  }
});

// Delete a User by ID
router.delete("/:id", async (request, response) => {
  try {
    const data = await User.findByIdAndDelete(request.params.id);

    response.json(data);
  } catch(error) {
    // Output error to the console incase it fails to send in response
    console.log(error);

    return response.status(500).json(error.errors);
  }
});

// Update a user by ID
router.put("/:id", async (request, response) => {
  console.log("Update route hit. Body:", request.body);
  try {
    const updates = request.body;

    const data = await User.findByIdAndUpdate(
      request.params.id,
      { $set: updates },
      {
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

// router.put("/login", async (request, response) => {})



export default router;
