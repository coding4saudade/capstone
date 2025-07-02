import html from "html-literal";

export default state => {
  // Get hosted events by current user

const currentUsername = state.username || state.user?.username;

const hostedEvents = state.events?.filter(
  event => event.createdBy?.username === currentUsername
);



  return html`
    <h2>Edit Your Hosted Events</h2>
    <!-- Postive popup -->
    <div id="global-popup" class="popup hidden"></div>
    <!-- Delete confirmation popup -->
<div id="delete-popup" class="popup hidden">
  <div class="popup-content">
    <h3>Delete Event?</h3>
    <p id="delete-event-name"><strong></strong></p>
    <p id="delete-event-date"></p>
    <div class="popup-actions">
      <button class="danger" id="confirm-delete">Delete!</button>
      <button id="cancel-delete">Cancel</button>
    </div>
  </div>
</div>

    ${hostedEvents?.length
      ? `
        <ul id="editEventsList">
          ${hostedEvents.map(event => `
            <li data-id="${event._id}" class="edit-event-item">
              <strong>${event.eventName}</strong><br />
              <span>${event.eventDate} @ ${event.startTime}–${event.endTime}</span><br />
              <span>${event.address}</span><br />
              <div class="eventActions">
                <button class="updateEventButton" data-id="${event._id}">Update</button>
                <button class="deleteEventButton" data-id="${event._id}"data-name="${event.eventName}"data-date="${event.eventDate}">Delete</button>
              </div>
            </li>
          `).join("")}
        </ul>
      `
      : "<p>You currently have no hosted events.</p>"
    }
  <div class="eventActions">

    <button class="createEventButton">Create New Event</button>
  </div>


  `;
};



