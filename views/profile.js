import html from "html-literal";

const allInterests = [
  "sports",
  "music",
  "dancing",
  "hiking",
  "art",
  "politics",
  "philosophy",
  "martial arts",
  "gardening",
  "craftsmanship"
];

export default state => html`
  <h2>Welcome back, ${state.username || "User"}!</h2>

  <h3>Your Current Interests:</h3>
  <ul id="currentInterests">
    ${
      (state.interests && state.interests.length)
        ? state.interests.map(i => `<li>${i}</li>`).join("")
        : "<li>No interests yet</li>"
    }
  </ul>

  <h3>Add More Interests</h3>
  <form id="interestsForm">
    <fieldset>
      <legend>Select interests to add (check any):</legend>
      ${allInterests.map(interest => `
        <label>
          <input
            type="checkbox"
            name="interests"
            value="${interest}"
            ${state.interests && state.interests.includes(interest) ? "checked" : ""}
          />
          ${interest}
        </label><br />
      `).join("")}
    </fieldset>
    <br />
    <button type="submit">Update Interests</button>
  </form>
`;
