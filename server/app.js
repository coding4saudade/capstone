// "Import" the Express module instead of http
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import users from './controllers/users.js';
import events from './controllers/events.js'

// Load environment variables from .env file
dotenv.config();

mongoose.connect( process.env.MONGODB );
const db = mongoose.connection;
//life cycle events for DB connection.  log errors or console successful connection
db.on("error", console.error.bind(console, "Connection Error:"));
db.once(
  "open",
  console.log.bind(console, "Successfully opened connection to Mongo!")
);

// Load environment variables from .env file
dotenv.config();

// get the PORT from the environment variables, OR use 3000 as default
const PORT = process.env.PORT || 4000;

// Initialize the Express application
const app = express();

const logging = (request, response, next) => {
  console.log(`${request.method} ${request.url} ${new Date().toLocaleString("en-us")}`);
  next();
};

app.use(cors());
app.use(express.json());
app.use(logging);

// Handle the request with HTTP GET method from http://localhost:3000/
app.get("/", (request, response) => {
   response.send("Welcome to the Connection App");
});

// Handle the request with HTTP GET method from http://localhost:3000/status
app.get("/status", (request, response) => {
   // Create the headers for response by default 200
   // Create the response body
   // End and return the response
  response.json({ message: "Service healthy" });
});
// Handle the request with HTTP GET method with query parameters and a url parameter
app.get("/weather/:city", (request, response) => {
  // Express adds a "params" Object to requests that has an matches parameter created using the colon syntax
  const city = request.params.city;

  // Set defaults values for the query string parameters
  let lowTemp = 32;
  if ("lowtemp" in request.query) {
    lowTemp = Number(request.query.lowtemp);
  }

  // Generate a random number to use as the temperature
  // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
  const min = 70;
  const max = 90;
  const highTemp = Math.floor(Math.random() * (max - min + 1) + min);

  // handle GET request for weather with an route parameter of "city"
  response.json({
    text: `The weather in ${city} is ${highTemp} degrees today.`,
    temp: {
      current: highTemp,
      low: lowTemp
    },
    city
  });
});


app.use("/users", users);
app.use("/events", events);




// Tell the Express app to start listening
// Let the humans know I am running and listening on 4000
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));



