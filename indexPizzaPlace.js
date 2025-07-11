import * as components from "./components";
import * as store from "./store";
import Navigo from "navigo";
import { camelCase } from "lodash";
import axios from "axios";
import {
  initializeSession,
  logout,
  attachUserHomeListeners,
  isLoggedIn,
  render,
  showDeleteConfirmation,
  showPopup,
  loadLeaflet,
  renderEventMap
} from "./utils/utils.js";

const router = new Navigo("/");
export default router;





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
      // Login form logic
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

      // Map loading logic
      loadLeaflet().then(() => {
        console.log("Map starting to load");

        // Initialize the map centered on St. Louis
        const map = L.map("map").setView([38.627, -90.1994], 10);
        console.log("Map object:", map);

        // Add OSM tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors"
        }).addTo(map);

        // Fetch real events from backend and add markers
        axios.get("http://localhost:4000/events")
          .then(res => {
            const events = res.data.filter(e => e.latitude && e.longitude);

            events.forEach(e => {
              const icon = L.divIcon({
                className: "custom-marker",
                html: `<div style="background-color:blue;width:12px;height:12px;border-radius:50%;"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              });

              L.marker([e.latitude, e.longitude], { icon })
                .bindPopup(`<strong>${e.eventName}</strong><br>${e.address}`)
                .addTo(map);
            });
          })
          .catch(err => {
            console.error("Error loading events:", err);
          });

        // Add marketing/demo dots across St. Louis city & county
        const marketingDots = [
          { lat: 38.6270, lon: -90.1994, label: "Downtown STL" },
          { lat: 38.6316, lon: -90.2536, label: "The Hill" },
          { lat: 38.6383, lon: -90.2843, label: "Forest Park" },
          { lat: 38.5963, lon: -90.2273, label: "Tower Grove" },
          { lat: 38.6141, lon: -90.2625, label: "Central West End" },
          { lat: 38.6684, lon: -90.5130, label: "Chesterfield" },
          { lat: 38.7401, lon: -90.3896, label: "Florissant" },
          { lat: 38.5951, lon: -90.4471, label: "Kirkwood" },
          { lat: 38.6276, lon: -90.3260, label: "University City" },
          { lat: 38.6654, lon: -90.3781, label: "Hazelwood" },
          { lat: 38.6360, lon: -90.3451, label: "Ladue" },
          { lat: 38.5920, lon: -90.3836, label: "Webster Groves" },
          { lat: 38.6745, lon: -90.4061, label: "Maryland Heights" },
          { lat: 38.5521, lon: -90.4762, label: "Sunset Hills" },
          { lat: 38.6558, lon: -90.2932, label: "Richmond Heights" }
        ];

        marketingDots.forEach(dot => {
          L.circleMarker([dot.lat, dot.lon], {
            radius: 8,
            fillColor: "blue",
            color: "blue",
            weight: 1,
            opacity: 1,
            fillOpacity: 1
          })
            .addTo(map)
            .bindTooltip(dot.label, { direction: "top" });
        });
      });
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
      // First load events from backend
      axios.get("http://localhost:4000/events").then(res => {
        store.events = res.data;

        // Then fetch weather
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=St. Louis&units=imperial&appid=...`)
          .then(weatherRes => {
            store.userHome.weather = {
              city: weatherRes.data.name,
              description: weatherRes.data.weather?.[0]?.description,
              temp: weatherRes.data.main?.temp,
              feelsLike: weatherRes.data.main?.feels_like
            };

            render(store.userHome);
            attachUserHomeListeners();

            loadLeaflet().then(() => {
              renderEventMap(store.events, store.session.user.interests);
            });
          })
          .catch(err => {
            console.error("Weather API error:", err);
            store.userHome.weather = {};

            render(store.userHome);
            attachUserHomeListeners();

            loadLeaflet().then(() => {
              renderEventMap(store.events, store.session.user.interests);
            });
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
