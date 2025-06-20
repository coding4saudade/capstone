import html from "html-literal"

export default state => html`<div> Profile Page </div>

<h1> Heat Map of Your interest/Events near you </h1>

<div class="image-placeholder">
    Image Placeholder
  </div>

<h2> Current Interests </h2>
<ul>
  <li>stuff </li>
  <li>stuff </li>
  <li>stuff </li>
</ul>
  <h2>Add Your Interests</h2>
<input type="text" id="interestInput" placeholder="Type an interest" />
<button id="addInterestBtn">Add Interest</button>

<ul id="interestsList"></ul>

<form id="profileForm">
  <button type="submit">Submit Profile</button>
</form>
 <h3>
    The weather in ${state.weather.city} is ${state.weather.description}. Temperature is ${state.weather.temp}F, and it feels like ${state.weather.feelsLike}F.
 </h3>
`
