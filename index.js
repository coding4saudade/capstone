import * as components from "./components";
import * as store from "./store";
import Navigo from "navigo";
import { camelCase } from "lodash";
import axios from "axios";

const router = new Navigo("/");
window.router = router;
window.store = store;

function initializeSession() {
  const sessionUserJSON = localStorage.getItem("sessionUser");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (sessionUserJSON && isLoggedIn) {
    store.session.user = JSON.parse(sessionUserJSON);
    store.session.isLoggedIn = true;
    console.log("Session restored:", store.session.user);
  } else {
    store.session.user = null;
    store.session.isLoggedIn = false;
  }
}

function logout() {
  store.session.user = null;
  store.session.isLoggedIn = false;
  localStorage.removeItem("sessionUser");
  localStorage.removeItem("isLoggedIn");
  console.log("User logged out");

  router.navigate("/"); // redirect to login or home page after logout
  router.resolve();
}

// function render(state = store.home) {
//   console.log(">>> render called with state:", state);
//   console.log(">>> state.view:", state?.view);

// }


// Render function that updates the #root element with HTML from components
function render(state = store.home) {

console.log("Rendering view:", state.view);
  document.querySelector("#root").innerHTML = `
    ${components.header(state)}
    ${components.nav(store.links)}
    <div class="centered-content">
      ${components.main(state)}
      ${components.footer()}
    </div>
    <div id="global-popup" class="popup hidden"></div>
    <div id="delete-popup" class="popup hidden"></div>
  `;
  router.updatePageLinks();

  // Debug log to verify what view is rendering
  console.log("Rendering view:", state);

  // If userHome view, attach listeners for buttons and interests form
  if (state === store.userHome) {
    const createEventButton = document.querySelector(".createEventButton");
    console.log("createEventButton found:", createEventButton);
    if (createEventButton) {
      createEventButton.addEventListener("click", () => {
        console.log("Navigating to /createEvent");
        router.navigate("/createEvent");
      });
    }

    const editEventsButton = document.querySelector(".editEventsButton");
    console.log("editEventsButton found:", editEventsButton);
    if (editEventsButton) {
      editEventsButton.addEventListener("click", () => {
        console.log("Navigating to /editEvents");
        router.navigate("/editEvents");
      });
    }

    const form = document.querySelector("#interestsForm");
    console.log("interestForm element:", form);
    if (form) {
      form.addEventListener("submit", event => {
        event.preventDefault();
        const formData = new FormData(form);
        const selected = formData.getAll("interests");
        const userId = store.session.user._id;
        axios
          .put(`http://localhost:4000/users/${userId}`, { interests: selected })
          .then(response => {
            store.userHome.interests = response.data.interests;
            render(store.userHome);
            showPopup("Interest updated");
          })
          .catch(error => {
            alert("Could not update interests. Please try again.");
          });
      });
    }

    const logoutButton = document.querySelector("#logoutButton");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        logout();
      });
    }
  }


// Attach submit handler if in updateEvent view
if (state.view === "updateEvent") {
  const form = document.querySelector("#updateEventForm");
  console.log("Found updateEventForm?", form);

  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();
      //is form being seen?
      console.log("UpdateEvent form submitted");

      if (!store.updateEvent || !store.updateEvent._id) {
        console.error("store.updateEvent._id missing");
        alert("Cannot update event — missing event ID");
        return;
      }


            // debug store.updateEvent
        console.log("DEBUG: store.updateEvent = ", store.updateEvent);

        if (!store.updateEvent || !store.updateEvent._id) {
          console.error("updateEvent object or _id is missing.");
          alert("Something went wrong — event ID is missing.");
          return;
        }

      const formData = new FormData(form);
      const eventData = {
        createdBy: store.updateEvent.createdBy._id,
        eventName: formData.get("eventName"),
        address: formData.get("address"),
        visable: formData.get("visable"),
        eventDate: formData.get("eventDate"),
        startTime: formData.get("startTime"),
        endTime: formData.get("endTime"),
        interests: formData.getAll("interests"),
      };

      axios
        .put(`http://localhost:4000/events/${store.updateEvent._id}`, eventData)
        .then(response => {
          console.log(" Event updated successfully:", response.data);
          router.navigate(`/userHome/${store.session.user._id}`);
        })
        .catch(error => {
          console.error(" Failed to update event:", error);
          alert("Failed to update event. Please try again.");
        });
    });
  } else {
    console.warn(" updateEventForm not found in DOM.");
  }
}

if (state.view === "editEvents") {
  const createEventButton = document.querySelector(".createEventButton");
  if (createEventButton) {
    createEventButton.addEventListener("click", () => {
      router.navigate("/createEvent");
    });
  }

  const updateButtons = document.querySelectorAll(".updateEventButton");
  updateButtons.forEach(button => {
    const eventId = button.dataset.id;
    button.addEventListener("click", () => {
      router.navigate(`/editEvent/${eventId}`);
    });
  });

  const deleteButtons = document.querySelectorAll(".deleteEventButton");
  deleteButtons.forEach(button => {
    button.addEventListener("click", () => {
      const eventId = button.dataset.id;
      const eventName = button.dataset.name;
      const eventDate = button.dataset.date;

      showDeleteConfirmation({ eventId, eventName, eventDate });
    });
  });
}


if (state === store.home) {
    console.log(" home logic running");
  // Login form logic
  const loginForm = document.querySelector("#loginForm");
  console.log("loginForm  TEST !!!!! element:", loginForm);
  if (loginForm) {
    loginForm.addEventListener("submit", event => {
      event.preventDefault();
      const username = event.target.loginUsername.value.toLowerCase();
      console.log("Attempting login with username:", username);

      axios
        .get(`http://localhost:4000/users/username/${username}`)
        .then(res => {
          console.log("User found:", res.data);

          // Set session user and logged in flag
          store.session.user = res.data;
          store.session.isLoggedIn = true;
          console.log("DEBUG: store.session after login:", store.session);

              // Save user session to localStorage
          localStorage.setItem("sessionUser", JSON.stringify(res.data));
          localStorage.setItem("isLoggedIn", "true");

          router.navigate(`/userHome/${res.data._id}`);
        })
        .catch(err => {
          console.error("Login failed:", err);
          alert("Username not found.");
        });
    });
  }
}
  // Register form logic
if (state.view === store.createUser) {
  console.log(" createUser logic running");

  const registerForm = document.querySelector("#registerForm");
  console.log("Found registerForm?", registerForm);
  if (registerForm) {
    registerForm.addEventListener("submit", event => {
      event.preventDefault();

      const formData = new FormData(registerForm);
      const newUser = {
        username: formData.get("username").toLowerCase(),
        email: formData.get("email").toLowerCase(),
        startingAddress: formData.get("startingAddress"),
        interests: formData.getAll("interests")
      };

      console.log("Submitting new user:", newUser);

      axios
        .post("http://localhost:4000/users", newUser)
        .then(res => {
          console.log("User created:", res.data);

          // Automatically log in the new user
          store.session.user = res.data;
          store.session.isLoggedIn = true;
          localStorage.setItem("sessionUser", JSON.stringify(res.data));
          localStorage.setItem("isLoggedIn", "true");

          //  Redirect to the new user's homepage
          router.navigate(`/userHome/${res.data._id}`);
        })
        .catch(err => {
          console.error("Failed to create user:", err);
          alert("Could not create user. Try a different username or check your input.");
        });
    });
  } else {
    console.warn("registerForm not found in DOM.");
  }
}




function showDeleteConfirmation({ eventId, eventName, eventDate }) {
  const popup = document.getElementById("delete-popup");
  if (!popup) return;

  popup.innerHTML = `
    <div class="popup-content">
      <h3>Delete Event?</h3>
      <p><strong>${eventName}</strong></p>
      <p>Date: ${eventDate}</p>
      <div class="popup-actions">
        <button id="confirm-delete" class="danger">Delete!</button>
        <button id="cancel-delete">Cancel</button>
      </div>
    </div>
  `;

  popup.classList.remove("hidden");

  document.getElementById("cancel-delete").addEventListener("click", () => {
    popup.classList.add("hidden");
  });

  document.getElementById("confirm-delete").addEventListener("click", () => {
    axios
      .delete(`http://localhost:4000/events/${eventId}`)
      .then(() => {
        popup.classList.add("hidden");
        showPopup("Event deleted", "#cc0000");
        console.log("Session user before navigating:", store.session.user);
        router.navigate(`/userHome/${store.session.user._id}`);
        router.resolve();


      })
      .catch(err => {
        console.error("Failed to delete event:", err);
        alert("Failed to delete event. Try again.");
      });
  });
}


function showPopup(message, color = "#28a745", duration = 2000) {
  const popup = document.getElementById("global-popup");
  if (!popup) return;
  popup.textContent = message;
  popup.style.backgroundColor = color;
  popup.classList.remove("hidden");
  setTimeout(() => {
    popup.classList.add("hidden");
  }, duration);
}
}
router.hooks({
  before: (done, match) => {
    const view = match?.data?.view ? camelCase(match.data.view) : "home";
    console.log("Before hook view:", view);
    switch (view) {
      case "userHome": {
        const userId = match.data.id;
        Promise.all([
          axios.get(`http://localhost:4000/users/${userId}`),
          axios.get("http://localhost:4000/events"),
          axios.get(
            `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.OPEN_WEATHER_MAP_API_KEY}&units=imperial&q=st%20louis`
          ),
        ])
          .then(([userResponse, eventResponse, weatherResponse]) => {
            Object.assign(store.userHome, userResponse.data);
            store.userHome.events = eventResponse.data;
            store.userHome.weather = {
              city: weatherResponse.data.name,
              temp: weatherResponse.data.main.temp,
              feelsLike: weatherResponse.data.main.feels_like,
              description: weatherResponse.data.weather[0].main,
            };
            store.session.user = userResponse.data;
            done();
          })
          .catch((err) => {
            console.error("Error loading userHome data:", err);
            done();
          });
        break;
      }
      case "editEvents":
        axios
          .get("http://localhost:4000/events")
          .then((response) => {
            store.editEvents.events = response.data;
            store.editEvents.user = store.session.user;
            done();
          })
          .catch((err) => {
            console.error("Failed to load events for editEvents:", err);
            done();
          });
        break;
      case "map":
        axios
          .get(
            "http://api.openweathermap.org/geo/1.0/direct?q=Saint Louis, MO, US&limit=1&appid=542793ec2898e42e6e2901f0da39637b"
          )
          .then((response) => {
            store.map.maps = response.data;
            done();
          })
          .catch((error) => {
            console.error("Error loading map:", error);
            done();
          });
        break;
      default:
        done();
    }
  },

  already: (match) => {
    const view = match?.data?.view ? camelCase(match.data.view) : "home";
    console.log("Already hook view:", view);
    render(store[view]);
  },

after: () => {


    // Nav toggle logic
    const barsIcon = document.querySelector(".fa-bars");
    if (barsIcon) {
      barsIcon.addEventListener("click", () => {
        const navUl = document.querySelector("nav > ul");
        if (navUl) navUl.classList.toggle("hidden--mobile");
      });
    }
  },
})


router.on({
  "/": () => render(),
"/userHome/:id": (match) => {
  const userId = match.data.id;
  console.log("Fetching userHome with ID:", userId);

  Promise.all([
    axios.get(`http://localhost:4000/users/${userId}`),
    axios.get("http://localhost:4000/events"),
  ])
    .then(([userResponse, eventResponse]) => {
      console.log("User data:", userResponse.data);

      //  Set userHome view explicitly
      Object.assign(store.userHome, {
        ...userResponse.data,
        view: "userHome",
        events: eventResponse.data
      });

      //  Ensure session is active
      store.session.user = userResponse.data;
      store.session.isLoggedIn = true;

      console.log("DEBUG: store.session after loading userHome:", store.session);

      render(store.userHome);
    })
    .catch((error) => {
      console.error("Error loading userHome:", error);
      render(store.viewNotFound);
    });
},

"/createUser": () => {
  console.log("Routing to /createUser");
  store.createUser.view = "createUser";
  render(store.createUser);
},


"/createEvent": () => {
  if (!store.session.user) {
    console.warn("No user logged in for createEvent");
    render(store.viewNotFound);
    return;
  }

  // Use the mutable object from the store
  store.createEvent.userId = store.session.user._id;
  store.createEvent.username = store.session.user.username;

  // Render the view
  render(store.createEvent);

  // After render: fill in the createdBy field
  const createdByInput = document.querySelector("#userName");
  if (createdByInput) {
    createdByInput.value = store.createEvent.username;
  }

  const form = document.querySelector("#eventForm");
  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();

      const formData = new FormData(form);
      const eventData = {
        createdBy: store.createEvent.userId,
        eventName: formData.get("eventName"),
        address: formData.get("eventAddress"),
        visable: formData.get("visable"),
        eventDate: formData.get("eventDate"),
        startTime: formData.get("startTime"),
        endTime: formData.get("endTime"),
        interests: formData.getAll("interests")
      };

      axios
        .post("http://localhost:4000/events", eventData)
        .then(response => {
          console.log("Event created successfully:", response.data);
          router.navigate(`/userHome/${store.createEvent.userId}`);
        })
        .catch(error => {
          console.error("Error creating event:", error);
          alert("Failed to create event. Please try again.");
        });
    });
  }
},



  "/editEvents": () => {
    console.log("Route /editEvents called");
    console.log("store.session.user:", store.session.user);
    if (!store.session.user) {
      console.warn("No user logged in for editEvents");
      render(store.viewNotFound);
      return;
    }
    const userId = store.session.user._id;

    axios
      .get(`http://localhost:4000/events/user/${userId}`)
      .then((response) => {
        Object.assign(store.editEventsData, {
          events: response.data,
          username: store.session.user.username,
          view: "editEvents",
        });

        console.log("Edit Events - fetched events:", response.data);


        render(store.editEventsData);
      })
      .catch((error) => {
        console.error("Failed to load events for editEvents:", error);
        render(store.viewNotFound);
      });
  },


"/editEvent/:id": (match) => {
  const eventId = match.data.id;
  console.log("Fetching event for editing, ID:", eventId);
  axios
    .get(`http://localhost:4000/events/${eventId}`)
    .then((response) => {
      store.updateEvent = store.updateEvent || {};
      Object.assign(store.updateEvent, {
        ...response.data,
        user: store.session.user,
        view: "updateEvent"
      });
      console.log("store.updateEvent before render:", store.updateEvent);
      render(store.updateEvent);
    })
    .catch((error) => {
      console.error("Error loading event for update:", error);
      render(store.viewNotFound);
    });
},



  "/:view": (match) => {
    const view = match?.data?.view ? camelCase(match.data.view) : "home";
    console.log("Generic route to view:", view);
    if (view in store) {
      render(store[view]);
    } else {
      console.warn("View not found in store:", view);
      render(store.viewNotFound);
    }
  },
});


initializeSession();

router.resolve();
