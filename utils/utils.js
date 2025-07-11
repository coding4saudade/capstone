import *  as store from "../store";
import * as components from "../components";
import axios from "axios";
import router from "../index.js";

export function initializeSession() {
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

export function logout() {
  store.session.user = null;
  store.session.isLoggedIn = false;
  localStorage.removeItem("sessionUser");
  localStorage.removeItem("isLoggedIn");
  console.log("User logged out");
  router.navigate("/");
  router.resolve();
}

export function attachUserHomeListeners() {
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



export function isLoggedIn() {
  if (!store.session.user) {
    router.navigate("/view-not-found");
    return false
  }
  return true
}

export function render(state = store.home) {
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

export function showDeleteConfirmation({ eventId, eventName, eventDate }) {
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

export function showPopup(message, color = "#28a745", duration = 2000) {
  const popup = document.getElementById("global-popup");
  if (!popup) return;
  popup.textContent = message;
  popup.style.backgroundColor = color;
  popup.classList.remove("hidden");
  setTimeout(() => {
    popup.classList.add("hidden");
  }, duration);
}


export function loadLeaflet() {
  return new Promise(resolve => {
    // Avoid reloading if already loaded
    if (window.L) return resolve();

    // Load Leaflet CSS
    const leafletCSS = document.createElement("link");
    leafletCSS.rel = "stylesheet";
    leafletCSS.href = "https://unpkg.com/leaflet/dist/leaflet.css";
    document.head.appendChild(leafletCSS);

    // Load Leaflet JS
    const leafletScript = document.createElement("script");
    leafletScript.src = "https://unpkg.com/leaflet/dist/leaflet.js";
    leafletScript.onload = resolve;
    document.body.appendChild(leafletScript);
  });
}

export function renderEventMap(events, userInterests) {
  console.log("renderEventMap called");
  console.log("events param:", events);
  console.log("userInterests param:", userInterests);


  const mapContainer = document.getElementById("interestMap");
  console.log("mapContainer:", mapContainer);

  if (!mapContainer) {
    console.warn("No #interestMap div found. Skipping map render.");
    return;
  }

  if (mapContainer._leaflet_id) {
    console.log("Existing Leaflet map found. Removing it.");
    mapContainer._leaflet_id = null;
    mapContainer.innerHTML = "";
  } else {
    console.log("No existing Leaflet map instance found.");
  }

  // Filter matched events
  const matchedEvents = events.filter(event =>
    event.interests?.some(interest => userInterests.includes(interest))
  );
  console.log("matchedEvents:", matchedEvents);

  // Calculate center coordinates
  let center = [38.627, -90.1994];
  if (matchedEvents.length > 0) {
    const avgLat = matchedEvents.reduce((sum, e) => sum + e.latitude, 0) / matchedEvents.length;
    const avgLon = matchedEvents.reduce((sum, e) => sum + e.longitude, 0) / matchedEvents.length;
    center = [avgLat, avgLon];
  }
  console.log("map center set to:", center);

  // Initialize Leaflet map
  const map = L.map("interestMap").setView(center, 10);
  console.log("Leaflet map initialized:", map);

  // Add OSM tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  console.log("Tile layer added");

  // Add markers for matched events
  matchedEvents.forEach(event => {
    console.log("Adding marker for event:", event.eventName);
    const icon = L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: blue; width: 12px; height: 12px; border-radius: 50%;"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    L.marker([event.latitude, event.longitude], { icon })
      .bindPopup(`<strong>${event.eventName}</strong><br>${event.address}`)
      .addTo(map);
  });

  console.log("All markers added");
}

export function renderEventMapByInterest() {
  renderEventMap(store.events, store.session.user.interests);
}

