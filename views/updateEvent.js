// components/updateEvent.js
import html from "html-literal";

const allInterests = [
  "sports", "music", "dancing", "hiking", "art",
  "politics", "philosophy", "martial arts", "gardening", "craftsmanship"
];

export default state => html`
  <h2>Update Event</h2>
  <form id="updateEventForm">

    <label for="eventName">Event Name:</label><br />
    <input type="text" id="eventName" name="eventName" value="${state.eventName}" required /><br /><br />

    <label for="address">Address:</label><br />
    <input type="text" id="address" name="address" value="${state.address}" required /><br /><br />

    <label for="visible">Visibility:</label>
    <select id="visible" name="visible" required>
      <option value="public" ${state.visible === "public" ? "selected" : ""}>Public</option>
      <option value="private" ${state.visible === "private" ? "selected" : ""}>Private</option>
    </select><br /><br />

    <label for="eventDate">Date:</label><br />
    <input type="date" id="eventDate" name="eventDate" value="${state.eventDate.split("T")[0]}" required /><br /><br />

    <label for="startTime">Start Time:</label><br />
    <input type="time" id="startTime" name="startTime" value="${state.startTime}" required /><br /><br />

    <label for="endTime">End Time:</label><br />
    <input type="time" id="endTime" name="endTime" value="${state.endTime}" required /><br /><br />

    <fieldset>
      <legend>Select Interests:</legend>
      ${allInterests.map(interest => `
        <label>
          <input type="checkbox" name="interests" value="${interest}" ${state.interests.includes(interest) ? "checked" : ""} />
          ${interest}
        </label><br />
      `).join("")}
    </fieldset><br />

    <button type="submit">Update Event</button>
  </form>
`;
