// import html from "html-literal";
// // Example of using a component inside another component
// import navItem from "./navItem.js";
// import * as store from "../store"; //this bring in the session status

// // constructing an HTML list of items from the array in Store
// //  - .map formats the array elements into html
// //      and constructs a new array from the results
// //  - .join joins the elements of the new array into one long string
// //  - data-navigo is a switch that allows Navigo to handle our page routing
// export default navItems => {
//   return html`
//     <nav>
//       <i class="fas fa-bars"></i>
//       <ul class="hidden--mobile nav-links">
//      ${navItems.filter(link => {
//           // Hide "User Home" unless logged in
//           if (link.text === "User Home" && !store.session.isLoggedIn) {
//             return false;
//           }
//           return true;
//         })
//         .map(link => `<li><a href="/${link.text}" data-navigo>${link.text}</a></li>`)
//         .join("")}
//     </ul>
//   </nav>
// `;
// }

import html from "html-literal";
import * as store from "../store"

export default () => {
  const isLoggedIn = store.session.isLoggedIn;
  const userId = store.session.user?._id;

  // Define links based on login state
  const links = isLoggedIn
    ? [
        { url: `/userHome/${userId}`, text: "User Home" },
        { url: "/aboutMe", text: "About Me" },
        { url: "/contactMe", text: "Send me a message" },
        { url: "/editEvents", text: "Edit an Event" },
        { url: `/editUser/${userId}`, text: "Edit your Account" },
      ]
    : [
        { url: "/", text: "Login" }, // renamed "Home" to avoid confusion
        { url: "/createUser", text: "Create an Account" },
        { url: "/contactMe", text: "Send me a message" },
      ];

  return html`
    <nav>
      <i class="fas fa-bars"></i>
      <ul class="hidden--mobile nav-links">
        ${links
          .map(link => `<li><a href="${link.url}" data-navigo>${link.text}</a></li>`)
          .join("")}
      </ul>
    </nav>
  `;
};
