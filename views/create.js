import html from "html-literal";

export default state => html`
  <h2>Create Account</h2>
  <form id="registerForm">
    <label for="username">Username:</label><br />
    <input type="text" id="username" name="username" required /><br /><br />

    <label for="email">Email:</label><br />
    <input type="email" id="email" name="email" required /><br /><br />

    <label for="password">Password:</label><br />
    <input type="password" id="password" name="password" required /><br /><br />

    <fieldset>
      <legend>Select up to 10 Interests:</legend>
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

    <button type="submit">Register</button>
  </form>
`;
