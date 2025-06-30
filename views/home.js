import html from "html-literal"

export default state => html`

<h1> Heat Map of Events near you </h1>

<div class="image-placeholder">
    Image Placeholder
  </div>


<h1>Login to join the fun</h1>
<form id="loginForm" >
  <label for="loginUsername">Username or Email:</label><br>
  <input type="text" id="loginUsername" name="loginUsername" required><br><br>

  <!-- <label for="loginPassword">Password:</label><br>
  <input type="password" id="loginPassword" name="loginPassword" required><br><br> -->

  <button type="submit">Login</button>
</form>

<p class="signup-link">
  Don't have an account? <a href="/createUser" data-navigo>Sign Up Here</a>
</p>



`;
