import html from "html-literal";

export default state => {
  // Get hosted events by current user
  const hostedEvents = state.events?.filter(
    event => event.createdBy === (state.username || state.user?.username)
  );

  return html`
    <h2>Edit Your Hosted Events</h2>

    ${hostedEvents?.length
      ? `
        <ul id="editEventsList">
          ${hostedEvents.map(event => `
            <li data-id="${event._id}" class="edit-event-item">
              <strong>${event.eventName}</strong><br />
              <span>${event.eventDate} @ ${event.startTime}–${event.endTime}</span><br />
              <span>${event.address}</span><br />
              <div class="eventActions">
                <button class="update-event-button" data-id="${event._id}">Update</button>
                <button class="delete-event-button" data-id="${event._id}">Delete</button>
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



