import html from "html-literal"

export default state => html`

<h2>Create Account</h2>
<form id="registerForm">
  <label for="username">Username:</label><br>
  <input type="text" id="username" name="username" required><br><br>

  <label for="email">Email:</label><br>
  <input type="email" id="email" name="email" required><br><br>

  <label for="password">Password:</label><br>
  <input type="password" id="password" name="password" required><br><br>

  <button type="submit">Register</button>
</form>
`
