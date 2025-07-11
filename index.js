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
        console.log("!!!!!!userID!!!", match.data);
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
        isLoggedIn();

        axios
          .get(`http://localhost:4000/events/user/${store.session.user._id}`)
          .then(response => {
            store.editEvents.events = response.data;
            done();
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
            done();
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

    // const barsIcon = document.querySelector(".fa-bars");
    // if (barsIcon) {
    //   barsIcon.addEventListener("click", () => {
    //     const navUl = document.querySelector("nav > ul");
    //     if (navUl) navUl.classList.toggle("hidden--mobile");
    //   });
    // }

    if (view === "home") {
      // Login form logic
      const form = document.querySelector("#loginForm");
      if (form) {
        form.addEventListener("submit", event => {
          event.preventDefault();
          const username = event.target.loginUsername.value.toLowerCase();
          axios
            .get(`${process.env.CONNECTION_API_URL}/users/username/${username}`)
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


          const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressQuery)}&format=json`;

          fetch(geocodeUrl, {
            headers: {
              "Accept-Language": "en",
              "User-Agent": "Connextion/1.0 (info@email.com)" // Change this if needed
            }
          })
            .then(res => res.json())
            .then(data => {
              if (!data || data.length === 0) {
                alert("Could not find location. Please check the address.");
                return;
              }

              const { lat, lon } = data[0];

              const newUser = {
                username: formData.get("username").toLowerCase(),
                email: formData.get("email").toLowerCase(),
                startingAddress: addressQuery,
                latitude: parseFloat(lat),
                longitude: parseFloat(lon),
                interests: formData.getAll("interests")
              };

              return axios.post("http://localhost:4000/users", newUser);
            })
            .then(res => {
              if (!res) return; //

              store.session.user = res.data;
              store.session.isLoggedIn = true;
              localStorage.setItem("sessionUser", JSON.stringify(res.data));
              localStorage.setItem("isLoggedIn", "true");
              router.navigate(`/userHome/${res.data._id}`);
            })
            .catch(err => {
              console.error("Failed to create user or geocode address:", err);
              alert("Could not create user. Please check your input and try again.");
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
      axios.get("http://localhost:4000/events").then(res => {
        store.events = res.data;
      console.log("store.events", store.events)
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
            attachUserHomeListeners();

            loadLeaflet().then(() => {
              const userLat = store.session.user?.latitude || 38.627;
              const userLon = store.session.user?.longitude || -90.1994;

              const map = L.map("interestsMap").setView([userLat, userLon], 12);
              console.log("Map centered on:", userLat, userLon);

              L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors"
              }).addTo(map);

              // Google style User location blue dot
              const userIcon = L.icon({
                iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png", // replace this with your choice
                iconSize: [32, 32],   // size of the icon
                iconAnchor: [16, 32], // point of the icon which corresponds to marker's location
                popupAnchor: [0, -32] // point from which the popup should open relative to the iconAnchor
              });

              L.marker([userLat, userLon], { icon: userIcon })
                .addTo(map)
                .bindPopup("📍 You Are Here");


              // Only event markers where interests match user interests (green)
              store.events
                .filter(e => e.latitude && e.longitude && e.interests.some(interest => store.session.user.interests.includes(interest)))
                .forEach(e => {
                  const eventIcon = L.divIcon({
                    className: "event-marker",
                    html: `<div style="background-color:green;width:12px;height:12px;border-radius:50%;"></div>`,
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                  });

                  L.marker([e.latitude, e.longitude], { icon: eventIcon })
                    .bindPopup(`<strong>${e.eventName}</strong><br>${e.address}`)
                    .addTo(map);
                });
            });
          })
          .catch(err => {
            console.error("Weather API error:", err);
            store.userHome.weather = {};

            render(store.userHome);
            attachUserHomeListeners();
            //repeating map code if weather API fails, so the page still loads.  I need to reform this into a function later
            loadLeaflet().then(() => {
              const userLat = store.session.user?.latitude || 38.627;
              const userLon = store.session.user?.longitude || -90.1994;

              const map = L.map("interestsMap").setView([userLat, userLon], 12);
              console.log("Map centered on:", userLat, userLon);

              L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors"
              }).addTo(map);


              // Google style User location blue dot
              const userIcon = L.icon({
                iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
              });

              L.marker([userLat, userLon], { icon: userIcon })
                .addTo(map)
                .bindPopup("📍 You Are Here");


              // Only event markers where interests match user interests (green)
              store.events
                .filter(e => e.latitude && e.longitude && e.interests.some(interest => store.session.user.interests.includes(interest)))
                .forEach(e => {
                  const eventIcon = L.divIcon({
                    className: "event-marker",
                    html: `<div style="background-color:green;width:12px;height:12px;border-radius:50%;"></div>`,
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                  });

                  L.marker([e.latitude, e.longitude], { icon: eventIcon })
                    .bindPopup(`<strong>${e.eventName}</strong><br>${e.address}`)
                    .addTo(map);
                });
            });
          });
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
            "Accept-Language": "en", // helps with consistent results per documentation
            "User-Agent": "Connextion/1.0 (info@email.com)" // Required if on server or backend per documentation
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
              longitude: parseFloat(lon) // lat and lon are returned from API as a string
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
    // add menu toggle to bars icon in nav bar



    document.querySelector(".fa-bars").addEventListener("click", () => {
       console.log("Fa-bars clicked" )

      document.querySelector("nav > ul").classList.toggle("hidden--mobile");

    });
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
