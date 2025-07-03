import html from "html-literal";

export default state => html`
  <h2>Create an Event</h2>
  <form id="eventForm">

    <label for="createdBy">Created by:</label><br />
    <input type="text" id="userName" name="createdBy"  /><br /><br />

    <label for="eventName">Event Name:</label><br />
    <input type="text" id="eventName" name="eventName" required /><br /><br />

    <label for="eventAddress">Address:</label><br />
    <input type="text" id="eventAddress" name="eventAddress" required /><br /><br />


    <label for="visable">Closed Event?</label>
    <select id="visable" name="visable">
        <option value="" hidden>Private or Public event</option>
        <option value="private">private</option>
        <option value="public">public</option>

    </select>


    <label for="eventDate">Date:</label><br />
    <input type="date" id="eventDate" name="eventDate" required /><br /><br />

    <label for="startTime">Start time:</label><br />
    <input type="time" id="startTime" name="startTime" required /><br /><br />

     <label for="endTime">End time:</label><br />
    <input type="time" id="endTime" name="endTime" required /><br /><br />

    <fieldset>
      <legend>Select Corresponding Interests (at least one required):</legend>
      <label><input type="checkbox" name="interests" value="sports" /> Sports</label><br />
      <label><input type="checkbox" name="interests" value="music" /> Music</label><br />
      <label><input type="checkbox" name="interests" value="dancing" /> Dancing</label><br />
      <label><input type="checkbox" name="interests" value="hiking" /> Hiking</label><br />
      <label><input type="checkbox" name="interests" value="art" /> Art</label><br />
      <label><input type="checkbox" name="interests" value="politics" /> Politics</label><br />
      <label><input type="checkbox" name="interests" value="philosophy" /> Philosophy</label><br />
      <label><input type="checkbox" name="interests" value="martial arts" /> Martial Arts</label><br />
      <label><input type="checkbox" name="interests" value="gardening" /> Gardening</label><br />
      <label><input type="checkbox" name="interests" value="craftsmanship" /> Craftsmanship</label><br />
    </fieldset><br />

    <button type="submit">Create Event</button>
  </form>
`;
