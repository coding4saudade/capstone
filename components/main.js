import html from "html-literal";
import * as views from "../views";

// export default (state) => html`
//    ${views['home']()}
//    ${views['aboutMe']()}
//    ${views['pizza']()}
//    ${views['order']()}
// `; code below replaces above
export default state => html`${views[state.view](state)} `;
