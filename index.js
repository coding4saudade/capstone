import * as components from "./components";
import * as store from "./store";
import Navigo from "navigo";
import { camelCase } from "lodash";
import axios from "axios";

const router = new Navigo("/");

// Render function that updates the #root element with HTML from components
function render(state = store.home) {
  document.querySelector("#root").innerHTML = `
    ${components.header(state)}
    ${components.nav(store.links)}
    <div class="centered-content">
      ${components.main(state)}
      ${components.footer()}
    </div>
  `;
  router.updatePageLinks();
}

router.hooks({
  // before hook to fetch any data required before the view renders
  before: (done, match) => {
    console.info("Before hook executing");
    const view = match?.data?.view ? camelCase(match.data.view) : "home";

    switch (view) {
      case "userHome":
        // Fetch weather data for userHome page
        axios
          .get(
            `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.OPEN_WEATHER_MAP_API_KEY}&units=imperial&q=st%20louis`
          )
          .then(response => {
            // Store weather info in store.userHome.weather
            store.userHome.weather = {
              city: response.data.name,
              temp: response.data.main.temp,
              feelsLike: response.data.main.feels_like,
              description: response.data.weather[0].main
            };
            done();
          })
          .catch(err => {
            console.log(err);
            done();
          });
        break;

      case "map":
        // Fetch map/geolocation data
        axios
          .get(
            `http://api.openweathermap.org/geo/1.0/direct?q=Saint Louis, MO, US&limit=1&appid=542793ec2898e42e6e2901f0da39637b`
          )
          .then(response => {
            store.map.maps = response.data;
            console.log(store.map.maps);
            done();
          })
          .catch(error => {
            console.log("It puked", error);
            done();
          });
        break;

      default:
        // For all other views, just continue
        done();
    }
  },

  // already hook to handle rendering if the view is already active
  already: match => {
    const view = match?.data?.view ? camelCase(match.data.view) : "home";
    render(store[view]);
  },

  // after hook to run after the view is rendered - good for adding event listeners
  after: (match) => {
    console.info("After hook executing");
    const view = match?.data?.view ? camelCase(match.data.view) : "home";

    // For the createUser page, add submit event listener on the form
    if (view === "createUser") {
      // Get the form element safely
      const form = document.querySelector("form");
      if (form) {
        form.addEventListener("submit", event => {
          // Prevent default form submission to handle via AJAX
          event.preventDefault();

          console.log("testing register button click");
          const inputList = event.target.elements;
          console.log("Input Element List", inputList);

          // Collect interests from checked checkboxes
          const interests = [];
          for (let checkboxInput of inputList.interests) {
            if (checkboxInput.checked) {
              interests.push(checkboxInput.value);
            }
          }

          // Build request data object
          const requestData = {
            username: inputList.username.value,
            email: inputList.email.value,
            interests: interests
          };
          console.log("request Body", requestData);

          //  add user to local store users array
          store.users.users.push(requestData);

          // POST the new user to the server API
          axios
            .post(`http://localhost:4000/users`, requestData)
            .then(response => {
              const newUser = response.data;
              //set session state to logged in

              store.session.isLoggedIn = true;
              store.session.user = newUser;
              // Add the response user (with _id) to store.users.users
              store.users.users.push(newUser);

              // Show the popup message for user created
              const popup = document.getElementById("popup-message");
              if (popup) {
                popup.textContent = "User created!";
                popup.classList.remove("hidden");
              }

              // Hide popup and redirect after 2 seconds to the new user's page
              setTimeout(() => {
                if (popup) popup.classList.add("hidden");
                router.navigate(`/userHome/${newUser._id}`);
              }, 2000);
            })
            .catch(error => {
              console.log("It puked", error);
            });
        });
      }
    }

    if (view === "home") {
  const loginForm = document.querySelector("#loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", event => {
      event.preventDefault();

      const username = event.target.loginUsername.value;

      // You can adjust this to hit your actual login/auth endpoint
      axios
        .get(`http://localhost:4000/users?username=${username}`)
        .then(response => {
          const user = response.data[0];

          if (!user) {
            alert("User not found. Please sign up.");
            return;
          }

          //  Save to session state
          store.session.isLoggedIn = true;
          store.session.user = user;

          //  Navigate to user's home
          router.navigate(`/userHome/${user._id}`);
        })
        .catch(error => {
          console.error("Login failed:", error);
          alert("Login failed. Please try again.");
        });
    });
  }
}




    // Update links on page after rendering
    router.updatePageLinks();

    // Add menu toggle on hamburger icon click, only if it exists
    const barsIcon = document.querySelector(".fa-bars");
    if (barsIcon) {
      barsIcon.addEventListener("click", () => {
        const navUl = document.querySelector("nav > ul");
        if (navUl) navUl.classList.toggle("hidden--mobile");
      });
    }
  }
});

// Define routes to render views based on URL
router.on({
  "/": () => render(),
  // :view slot matches any single URL segment after slash


  // Route for userHome with dynamic user ID
  "/userHome/:id": function(match) {
    const userId = match.data.id;  // Extract ID from URL
    console.log("Fetching user with ID:", userId);

    // Fetch user data from backend
    axios.get(`http://localhost:4000/users/${userId}`)
      .then(response => {
        // Merge fetched user data into your userHome state
        // oh goodness, kept getting id errors from server
        // store exports to const, need to mutate its existing property instead
        //mutated properties instead of replaicng object
        // take user data from backend (response.data) and merge it into the existing store.userHome object

        //if there is something in store.userHome with same key it will be overwritten


        console.log("Fetched user from DB:", response.data); // checking to see what comes back


        Object.assign(store.userHome, response.data);

        // Render userHome with updated data
        render(store.userHome);
      })
      .catch(error => {
        console.error("Failed to fetch user by ID:", error);

        // Optionally render a 404 or error page
        render(store.viewNotFound);
      });
  },








  "/:view": function(match) {
    console.info("Route Handler Executing");

    // Use camelCase for view name from URL
    const view = match?.data?.view ? camelCase(match.data.view) : "home";

    // Render the view if it exists in the store, else show not found page
    if (view in store) {
      render(store[view]);
    } else {
      render(store.viewNotFound);
      console.log(`View ${view} not defined`);
    }
  }
}).resolve();
