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
  router.navigate("/");
  router.resolve();
}

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
  console.log("Rendering view:", state);
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

router.hooks({
  before: (done, match) => {
    const view = match?.data?.view ? camelCase(match.data.view) : "home";
    console.log("Before hook view:", view);
    switch (view) {
      case "userHome": {
        const userId = match.data.id;
        Promise.all([
          axios.get(`http://localhost:4000/users/${userId}`),
          axios.get("http://localhost:4000/events")
        ])
          .then(([userResponse, eventResponse]) => {
            Object.assign(store.userHome, userResponse.data);
            store.userHome.events = eventResponse.data;
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
  after: (match) => {
    const view = match?.data?.view ? camelCase(match.data.view) : "home";

    const barsIcon = document.querySelector(".fa-bars");
    if (barsIcon) {
      barsIcon.addEventListener("click", () => {
        const navUl = document.querySelector("nav > ul");
        if (navUl) navUl.classList.toggle("hidden--mobile");
      });
    }

    if (view === "home") {
      const form = document.querySelector("#loginForm");
      if (form) {
        form.addEventListener("submit", event => {
          event.preventDefault();
          const username = event.target.loginUsername.value.toLowerCase();
          axios
            .get(`http://localhost:4000/users/username/${username}`)
            .then(res => {
              store.session.user = res.data;
              store.session.isLoggedIn = true;
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

    if (view === "createUser") {
      const registerForm = document.querySelector("#registerForm");
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
          axios
            .post("http://localhost:4000/users", newUser)
            .then(res => {
              store.session.user = res.data;
              store.session.isLoggedIn = true;
              localStorage.setItem("sessionUser", JSON.stringify(res.data));
              localStorage.setItem("isLoggedIn", "true");
              router.navigate(`/userHome/${res.data._id}`);
            })
            .catch(err => {
              console.error("Failed to create user:", err);
              alert("Could not create user. Try a different username or check your input.");
            });
        });
      }
    }

    if (view === "updateEvent") {
      const updateForm = document.querySelector("#updateEventForm");
      if (updateForm) {
        updateForm.addEventListener("submit", event => {
          event.preventDefault();
          const formData = new FormData(updateForm);
          const eventData = {
            createdBy: store.updateEvent.createdBy._id,
            eventName: formData.get("eventName"),
            address: formData.get("address"),
            visable: formData.get("visable"),
            eventDate: formData.get("eventDate"),
            startTime: formData.get("startTime"),
            endTime: formData.get("endTime"),
            interests: formData.getAll("interests")
          };
          axios
            .put(`http://localhost:4000/events/${store.updateEvent._id}`, eventData)
            .then(response => {
              router.navigate(`/userHome/${store.session.user._id}`);
            })
            .catch(error => {
              console.error("Failed to update event:", error);
              alert("Failed to update event. Please try again.");
            });
        });
      }
    }

    if (view === "editEvents") {
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
   if (store.userHome.view === "userHome") {
  console.log("MOOOOOOO!!!!Attaching event listeners for userHome");

  const editEventButton = document.querySelector(".editEventsButton");
  console.log("Found button:", editEventButton);

  if (editEventButton) {
    editEventButton.addEventListener("click", () => {
      router.navigate("/editEvents");
    });
  }
}


  }
});

router.on({
  "/": () => render(),
  "/userHome/:id": match => {
  const userId = match.data.id;
  Promise.all([
    axios.get(`http://localhost:4000/users/${userId}`),
    axios.get("http://localhost:4000/events")
  ])
    .then(([userResponse, eventResponse]) => {
      Object.assign(store.userHome, userResponse.data);
      store.userHome.events = eventResponse.data;
      store.userHome.view = "userHome";
      store.session.user = userResponse.data;
      render(store.userHome);
    })
    .catch(error => {
      console.error("Error loading userHome:", error);
      render(store.viewNotFound);
    });
},





  "/createUser": () => {
    store.createUser.view = "createUser";
    render(store.createUser);
  },
  "/createEvent": () => {
    if (!store.session.user) {
      render(store.viewNotFound);
      return;
    }
    store.createEvent.userId = store.session.user._id;
    store.createEvent.username = store.session.user.username;
    render(store.createEvent);
  },
  "/editEvents": () => {
    if (!store.session.user) {
      render(store.viewNotFound);
      return;
    }
    const userId = store.session.user._id;
    axios
      .get(`http://localhost:4000/events/user/${userId}`)
      .then(response => {
        Object.assign(store.editEventsData, {
          events: response.data,
          username: store.session.user.username,
          view: "editEvents"
        });
        render(store.editEventsData);
      })
      .catch(error => {
        console.error("Failed to load events for editEvents:", error);
        render(store.viewNotFound);
      });
  },
  "/editEvent/:id": match => {
    const eventId = match.data.id;
    axios
      .get(`http://localhost:4000/events/${eventId}`)
      .then(response => {
        store.updateEvent = store.updateEvent || {};
        Object.assign(store.updateEvent, {
          ...response.data,
          user: store.session.user,
          view: "updateEvent"
        });
        render(store.updateEvent);
      })
      .catch(error => {
        console.error("Error loading event for update:", error);
        render(store.viewNotFound);
      });
  },
  "/:view": match => {
    const view = match?.data?.view ? camelCase(match.data.view) : "home";
    if (view in store) {
      render(store[view]);
    } else {
      render(store.viewNotFound);
    }
  }
});

initializeSession();
router.resolve();
