import html from "html-literal";
import * as store from "../store"
import whale from "../assets/img/whale.svg";

export default () => {
  const isLoggedIn = store.session.isLoggedIn;
  const userId = store.session.user?._id;


  const links = isLoggedIn
    ? [
        { url: `/userHome/${userId}`, text: "User Home" },
        { url: "/aboutMe", text: "About Me" },
        { url: "/contactMe", text: "Send me a message" },
        { url: "/editEvents", text: "Edit an Event" },
        { url: `/editUser/${userId}`, text: "Edit your Account" },
      ]
    : [
        { url: "/", text: "Login" },
        { url: "/createUser", text: "Create an Account" },
        { url: "/contactMe", text: "Send me a message" },
      ];

  return html`
    <nav>
      <div class="nav-left" id="unique">
        <img src="https://www.svgrepo.com/show/530200/whale.svg" alt="Connextion Logo" class="nav-logo" />
        <div class="nav-title">
          <h1>Connextion</h1>
      </div>
    </div>
      <i class="fas fa-bars"></i>
      <ul class="hidden--mobile nav-links">
        ${links
          .map(link => `<li><a href="${link.url}" data-navigo>${link.text}</a></li>`)
          .join("")}
      </ul>
    </nav>


   <!-- <nav>
      <i class="fas fa-bars"></i>
      <ul class="hidden--mobile nav-links">
        ${links
          .map(link => `<li><a href="${link.url}" data-navigo>${link.text}</a></li>`)
          .join("")}
      </ul>
    </nav> -->
  `;
};
