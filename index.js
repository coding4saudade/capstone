import * as components from "./components";
import * as store from "./store";
import Navigo from "navigo";
import { camelCase } from "lodash";
import axios from "axios";

const router = new Navigo("/");


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

function attachUserHomeListeners(){

  const editEventButton = document.querySelector(".editEventsButton");
  if (editEventButton) {
    editEventButton.addEventListener("click", () => {
      console.log("Edit Events button clicked");
      router.navigate("/edit-events");
    });
  }

  const createEventButton = document.querySelector(".createEventButton");
  if (createEventButton) {
    createEventButton.addEventListener("click", () => {
      console.log("Create Event button clicked");
      router.navigate("/create-event");
    });
  }

  const logoutButton = document.querySelector(".logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      console.log("Logout button clicked");
      logout();
      router.navigate("/home");
    });
  }

  const form = document.querySelector("#interestsForm");
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
          attachUserHomeListeners();  // reattaching listeners after render
          showPopup("Interest updated");
        })
        .catch(error => {
          alert("Could not update interests. Please try again.");
        });
    });
  }
}



function isLoggedIn() {
  if (!store.session.user) {
    router.navigate("/view-not-found");
    return false
  }
  return true
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
    initializeSession();
    const view = match?.data?.view ? camelCase(match.data.view) : "home";
    console.log("Before hook view:", view);
    switch (view) {
      case "userHome":
        const userId = match.data.id;
        console.log("!!!!!!userID!!!", match.data)
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

      case "editEvents":
        isLoggedIn()


        axios
          .get(`http://localhost:4000/events/user/${store.session.user._id}`)
          .then(response => {

            store.editEvents.events = response.data;
            done()
          })
          .catch(error => {
            console.error("Failed to load events for editEvents:", error);
            router.navigate("/view-not-found");

          });

        break;

      // case "map":
      // axios
      //         .get(
      //   "http://api.openweathermap.org/geo/1.0/direct?q=Saint Louis, MO, US&limit=1&appid=542793ec2898e42e6e2901f0da39637b"
      // )
      //   .then((response) => {
      //     store.map.maps = response.data;
      //     done();
      //   })
      //   .catch((error) => {
      //     console.error("Error loading map:", error);
      //     done();
      //   });
      // break;
      case "createEvent":
        isLoggedIn(); // check user is logged in

        store.createEvent.userId = store.session.user._id;
        store.createEvent.username = store.session.user.username;

        done(); //
        break;
      case "updateEvent":

        const eventId = match.data.id;
        axios
          .get(`http://localhost:4000/events/${eventId}`)
          .then(response => {
            store.updateEvent = {
              ...response.data,
              user: store.session.user,
              view: "updateEvent"
            };
            //store.updateEvent.event = response.data;
            done()
          })
          .catch(error => {
            console.error("Error loading event for update:", error);
            router.navigate("/view-not-found");

          });

        break;

      default:
        done();
    }
  },
  after: (match) => {
    const view = match?.data?.view ? camelCase(match.data.view) : "home";
    console.log("After hook running for view:", view);

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
          router.navigate(`/updateEvent/${eventId}`);
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
if (view === "userHome") {
  axios
    .get(`https://api.openweathermap.org/data/2.5/weather?q=St. Louis&units=imperial&appid=542793ec2898e42e6e2901f0da39637b`)
    .then(res => {
      store.userHome.weather = {
        city: res.data.name,
        description: res.data.weather?.[0]?.description,
        temp: res.data.main?.temp,
        feelsLike: res.data.main?.feels_like
      };

      render(store.userHome);
      attachUserHomeListeners(); // Attaches listeners after rendering - i could not find the buttons without this
    })
    .catch(err => {
      console.error("Weather API error:", err);
      store.userHome.weather = {};
      render(store.userHome);
      attachUserHomeListeners(); // attaching listeners even if weather failed
    });
}


    if (view === "createEvent" && store.session.user) {
      const form = document.querySelector("#eventForm");
      console.log("⭐eventForm found in DOM!");

      const userNameInput = document.querySelector("#userName");
      if (userNameInput) {
        userNameInput.value = store.session.user.username;
      }

      form.addEventListener("submit", event => {
        event.preventDefault();

        const formData = new FormData(form);

        const street = formData.get("street") || "";
        const city = formData.get("city") || "";
        const state = formData.get("state") || "";
        const postalCode = formData.get("postalCode") || "";
        const country = formData.get("country") || "";

        const addressParts = [street, city, state, postalCode, country].filter(Boolean);
        const addressQuery = addressParts.join(", ");

        if (!addressQuery) {
          alert("Please enter a valid address.");
          return;
        }


        const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          addressQuery
        )}&format=json`;

        fetch(geocodeUrl, {
          headers: {
            "Accept-Language": "en", // optional but helps with consistent results
            "User-Agent": "Connextion/1.0 (info@email.com)" // Required if on server or backend
          }
        })
          .then(res => res.json())
          .then(data => {
            if (!data || data.length === 0) {
              alert("Could not find location. Please check the address.");
              return;
            }

            const { lat, lon } = data[0];

            const newEvent = {
              eventName: formData.get("eventName"),
              address: addressQuery,
              eventDate: formData.get("eventDate"),
              startTime: formData.get("startTime"),
              endTime: formData.get("endTime"),
              visible: formData.get("visible"),
              interests: formData.getAll("interests"),
              createdBy: store.session.user._id,
              latitude: parseFloat(lat), //parseFloat takes the string response and converts it to an actual number
              longitude: parseFloat(lon)
            };

            return axios.post("http://localhost:4000/events", newEvent);
          })
          .then(() => {
            alert("Event created!");
            router.navigate(`/userHome/${store.session.user._id}`);
          })
          .catch(error => {
            console.error("Error during geocoding or event creation:", error);
            alert("Could not get location or create event. Please check your input.");
          });
      });
    }





  }
});

router.on({
  "/": () => render(),
  "/:view": match => {
    const view = match?.data?.view ? camelCase(match.data.view) : "home";
    if (view in store) {
      render(store[view]);
    } else {
      render(store.viewNotFound);
    }
  },
  "/:view/:id": match => {
    const view = match?.data?.view ? camelCase(match.data.view) : "home";
    if (view in store) {
      render(store[view]);
    } else {
      render(store.viewNotFound);
    }
  }
});


router.resolve();
