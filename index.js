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
    <div id="global-popup" class="popup hidden"></div>
  `;
  router.updatePageLinks();

  // 🔍 Add debug log to verify render view
  console.log("Rendering view:", state);

  // Attach interests form submit listener if rendering userHome view
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
  }

  //  Attach login form submit listener for rendering home view
  if (state === store.home) {
    const loginForm = document.querySelector("#loginForm");
    console.log("loginForm element:", loginForm);
    if (loginForm) {
      loginForm.addEventListener("submit", event => {
        event.preventDefault();
        const username = event.target.loginUsername.value;
        console.log("Attempting login with username:", username);

        axios
          .get(`http://localhost:4000/users/username/${username}`)
          .then(res => {
            console.log("User found:", res.data);
            store.session.user = res.data;
            router.navigate(`/userHome/${res.data._id}`);
          })
          .catch(err => {
            console.error("Login failed:", err);
            alert("Username not found.");
          });
      });
    }
  }
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
      case "userHome":
        const userId = match.data.id;
        Promise.all([
          axios.get(`http://localhost:4000/users/${userId}`),
          axios.get("http://localhost:4000/events"),
          axios.get(`https://api.openweathermap.org/data/2.5/weather?appid=${process.env.OPEN_WEATHER_MAP_API_KEY}&units=imperial&q=st%20louis`)
        ])
          .then(([userResponse, eventResponse, weatherResponse]) => {
            Object.assign(store.userHome, userResponse.data);
            store.userHome.events = eventResponse.data;
            store.userHome.weather = {
              city: weatherResponse.data.name,
              temp: weatherResponse.data.main.temp,
              feelsLike: weatherResponse.data.main.feels_like,
              description: weatherResponse.data.weather[0].main
            };
            store.session.user = userResponse.data;
            done();
          })
          .catch(err => {
            console.error("Error loading userHome data:", err);
            done();
          });
        break;
          case "editEvents":
  axios.get("http://localhost:4000/events")
    .then(response => {
      store.editEvents.events = response.data;
      store.editEvents.user = store.session.user;
      done();
    })
    .catch(err => {
      console.error("Failed to load events for editEvents:", err);
      done();
    });
  break;
      case "map":
        axios
          .get("http://api.openweathermap.org/geo/1.0/direct?q=Saint Louis, MO, US&limit=1&appid=542793ec2898e42e6e2901f0da39637b")
          .then(response => {
            store.map.maps = response.data;
            done();
          })
          .catch(error => {
            console.error("Error loading map:", error);
            done();
          });
        break;

      default:
        done();
    }
  },

  already: match => {
    const view = match?.data?.view ? camelCase(match.data.view) : "home";
    console.log("Already hook view:", view);
    render(store[view]);
  },

  after: match => {
    const view = match?.data?.view ? camelCase(match.data.view) : "home";
    console.log("After hook view:", view);

    const barsIcon = document.querySelector(".fa-bars");
    if (barsIcon) {
      barsIcon.addEventListener("click", () => {
        const navUl = document.querySelector("nav > ul");
        if (navUl) navUl.classList.toggle("hidden--mobile");
      });
    }
  }
});

router.on({
  "/": () => render(),
  "/userHome/:id": match => {
    const userId = match.data.id;
    console.log("Fetching userHome with ID:", userId);
    Promise.all([
      axios.get(`http://localhost:4000/users/${userId}`),
      axios.get("http://localhost:4000/events")
    ])
      .then(([userResponse, eventResponse]) => {
        Object.assign(store.userHome, userResponse.data);
        store.userHome.events = eventResponse.data;
        store.session.user = userResponse.data;
        render(store.userHome);
      })
      .catch(error => {
        console.error("Error loading userHome:", error);
        render(store.viewNotFound);
      });
  },
"/editEvents": () => {
  if (!store.session.user) {
    console.warn("No user logged in for editEvents");
    render(store.viewNotFound);
    return;
  }

  const userId = store.session.user._id;

  axios.get(`http://localhost:4000/events`)
    .then(response => {
      // Only include events created by this user
      const hosted = response.data.filter(
        event => event.createdBy === store.session.user.username
      );

      Object.assign(store.editEventsData, {
        events: hosted,
        username: store.session.user.username,
        view: "editEvents"
      });

      render(store.editEventsData); // Pass data into the view
    })
    .catch(error => {
      console.error("Failed to load events for editEvents:", error);
      render(store.viewNotFound);
    });
},

  "/editEvent/:id": match => {
    const eventId = match.data.id;
    console.log("Fetching event for editing, ID:", eventId);
    axios
      .get(`http://localhost:4000/events/${eventId}`)
      .then(response => {
        store.updateEvent = {
          ...response.data,
          user: store.session.user
        };
        render(store.updateEvent);
      })
      .catch(error => {
        console.error("Error loading event for update:", error);
        render(store.viewNotFound);
      });
  },

  "/:view": match => {
    const view = match?.data?.view ? camelCase(match.data.view) : "home";
    console.log("Generic route to view:", view);
    if (view in store) {
      render(store[view]);
    } else {
      console.warn("View not found in store:", view);
      render(store.viewNotFound);
    }
  }
}).resolve();
