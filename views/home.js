
import html from "html-literal"



export default state => html`

  <section class="hero">
    <div class="hero-content">
      <h1>Welcome to Connextion

      </h1>
      <p>Discover, share, and join events that bring community together.</p>
      <button type="submit" class="btn">Sign Up</button>

    </div>
  </section>


<h1> Events near you </h1>

<div id="map"></div>

<h1>Login to join the fun</h1>
<form id="loginForm" >
  <label for="loginUsername">Username or Email:</label><br>
  <input type="text" id="loginUsername" name="loginUsername" required><br><br>

  <!-- <label for="loginPassword">Password:</label><br>
  <input type="password" id="loginPassword" name="loginPassword" required><br><br> -->

  <button type="submit" class="btn">Login</button>
</form>

<p class="signup-link">
  Don't have an account? <a href="/createUser" data-navigo>Sign Up Here</a>
</p>



`;
