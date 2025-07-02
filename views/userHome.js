import html from "html-literal";

const allInterests = [
  "sports", "music", "dancing", "hiking", "art",
  "politics", "philosophy", "martial arts", "gardening", "craftsmanship"
];

export default state => {
  console.log("Rendering userHome with state:", state);
  const matchedEvents = state.events?.filter(event =>
    event.interests?.some(interest => state.interests?.includes(interest))
  );

const currentUsername = state.username || state.user?.username;

const hostedEvents = state.events?.filter(event =>
  event.createdBy?.username === currentUsername
);

  return html`
    <h2>Welcome back, ${state.username || state.user?.username || "User"}!</h2>

    ${state.weather?.city ? `
      <h3>
        Weather in ${state.weather.city}: ${state.weather.description},
        ${state.weather.temp}°F (feels like ${state.weather.feelsLike}°F)
      </h3>
    ` : "<h3>Loading weather data...</h3>"}

<h3>Events Based on Your Interests</h3>
<ul id="interestEvents">
  ${matchedEvents?.length
    ? matchedEvents.map(event => `
        <li>
          <strong>${event.eventName}</strong><br />
          <em>Hosted by: ${event.createdBy?.username || "Unknown"}</em><br />
          <span>${event.eventDate} @ ${event.startTime}–${event.endTime}</span><br />
          <span>${event.address}</span>
        </li>
      `).join("")
    : "<li>No matching events</li>"
  }
</ul>


    <h3>Your Hosted Events</h3>
    <ul id="hostedEvents">
      ${hostedEvents?.length
        ? hostedEvents.map(event => `
            <li>
              <strong>${event.eventName}</strong><br />
              <span>${event.eventDate} @ ${event.startTime}–${event.endTime}</span><br />
              <span>${event.address}</span>
            </li>
          `).join("")
        : "<li>You have not hosted any events yet</li>"
      }
    </ul>

    <div class="eventActions">
      <button class="createEventButton">Create Event</button>
      <button class="editEventsButton" id="editEventsButton">Edit or Delete Events</button>
    </div>

    <h3>Your Interests</h3>
    <ul id="currentInterests">
      ${state.interests?.length
        ? state.interests.map(interest => `<li>${interest}</li>`).join("")
        : "<li>No interests yet</li>"
      }
    </ul>

    <h3>Update Your Interests</h3>
    <form id="interestsForm">
      <fieldset>
        <legend>Select interests:</legend>
        ${allInterests.map(interest => `
          <label>
            <input type="checkbox" name="interests" value="${interest}"
              ${state.interests?.includes(interest) ? "checked" : ""} />
            ${interest}
          </label><br />
        `).join("")}
      </fieldset>
      <button type="submit">Update Interests</button>
    </form>

    <button class="logoutButton" id="logoutButton">Logout</button>
  `;
};
