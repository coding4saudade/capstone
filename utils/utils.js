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
        .put(`${process.env.CONNECTION_API_URL}/${userId}`, { interests: selected })
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
      .delete(`${process.env.CONNECTION_API_URL}/${eventId}`)
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

