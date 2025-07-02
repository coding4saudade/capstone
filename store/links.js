// export default [
//   { url: "/home", text: "Home" },
//   { url: "/aboutMe", text: "About Me" },  // Take note: the multi-word URLs are kebab case (https://developer.mozilla.org/en-US/docs/Glossary/Kebab_case).
//   { url: "/contactMe", text: "Send me a message" },
//   { url: "/userHome", text: "User Home" },
//   { url: "/createEvent", text: "Create an Event" },
//   { url: "/createUser", text: "Create an Account" },
//   { url: "/editEvents", text: "Edit an Event" },
//   { url: "/updateEvent", text: "Update an Event" },
//   { url: "/editUser", text: "Edit your Account" },
//   { url: "/followedUsers", text: "Followed Users" }
// ];
import * as store from "../store"
//import store from "./store";

export default function getLinks() {
  if (store.session.isLoggedIn && store.session.user) {
    const userId = store.session.user._id;
    return [
      { url: `/userHome/${userId}`, text: "User Home" },
      { url: "/aboutMe", text: "About Me" },
      { url: "/contactMe", text: "Send me a message" },
      { url: "/editEvents", text: "Edit an Event" },
      { url: `/editUser/${userId}`, text: "Edit your Account" },
    ];
  } else {
    return [
      { url: "/", text: "Home" },  // Login page
      { url: "/createUser", text: "Create an Account" },
      { url: "/contactMe", text: "Send me a message" },
    ];
  }
}
