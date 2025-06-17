import html from "html-literal"

export default () => html`

<h2>Add Your Interests</h2>
<input type="text" id="interestInput" placeholder="Type an interest" />
<button id="addInterestBtn">Add Interest</button>

<ul id="interestsList"></ul>

<form id="profileForm">
  <button type="submit">Submit Profile</button>
</form>


  <div id="app"></div>


`;
