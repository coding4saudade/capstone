import * as store from "../store";
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

export function isLoggedIn() {
  if (!store.session.user) {
    router.navigate("/view-not-found");
    return false;
  }
  return true;
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
      .delete(`${process.env.CONNECTION_API_URL}/events/${eventId}`)
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
    if (window.L) return resolve();

    const leafletCSS = document.createElement("link");
    leafletCSS.rel = "stylesheet";
    leafletCSS.href = "https://unpkg.com/leaflet/dist/leaflet.css";
    document.head.appendChild(leafletCSS);

    const leafletScript = document.createElement("script");
    leafletScript.src = "https://unpkg.com/leaflet/dist/leaflet.js";
    leafletScript.onload = resolve;
    document.body.appendChild(leafletScript);
  });
}

export function renderUserInterestMap() {
  loadLeaflet().then(() => {
    const mapContainer = document.getElementById("interestsMap");
    if (!mapContainer) return;

    if (mapContainer._leaflet_id) {
      mapContainer._leaflet_id = null;
      mapContainer.innerHTML = "";
    }

    const userLat = store.session.user?.latitude || 38.627;
    const userLon = store.session.user?.longitude || -90.1994;
    const map = L.map("interestsMap").setView([userLat, userLon], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const userIcon = L.icon({
      iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    L.marker([userLat, userLon], { icon: userIcon })
      .addTo(map)
      .bindPopup("\ud83d\udccd You Are Here");

    store.userHome.events
      .filter(e =>
        e.latitude &&
        e.longitude &&
        e.interests.some(interest =>
          store.session.user.interests.includes(interest)
        )
      )
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
}

export function attachUserHomeListeners() {
  const bindClick = (selector, callback) => {
    const element = document.querySelector(selector);
    if (element) element.addEventListener("click", callback);
  };

  bindClick(".editEventsButton", () => router.navigate("/edit-events"));
  bindClick(".createEventButton", () => router.navigate("/create-event"));
  bindClick(".logoutButton", () => {
    logout();
    router.navigate("/home");
  });

  const form = document.querySelector("#interestsForm");
  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();
      const formData = new FormData(form);
      const selected = formData.getAll("interests");
      const userId = store.session.user._id;

      axios
        .put(`${process.env.CONNECTION_API_URL}/users/${userId}`, { interests: selected })
        .then(response => {
          store.userHome.interests = response.data.interests;
          render(store.userHome);
          attachUserHomeListeners();
          renderUserInterestMap();
          showPopup("Interest updated");
        })
        .catch(() => {
          alert("Could not update interests. Please try again.");
        });
    });
  }

  const directionButtons = document.querySelectorAll(".getDirectionsButton");
  directionButtons.forEach(button => {
    button.addEventListener("click", () => {
      const destination = button.dataset.address;

      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${destination}`;
          window.open(mapsUrl, "_blank");
        },
        error => {
          alert("Could not get your location. Please check your settings.");
          console.error("Geolocation error:", error);
        }
      );
    });
  });
}
