import * as components from "./components";
import * as store from "./store";
import Navigo from "navigo";
import { camelCase } from "lodash";
import axios from "axios";
import { setupInterestLimit } from "./components/interestSelector.js"; // NEW import for interests logic

const router = new Navigo("/");

function render(state = store.home) {
  document.querySelector("#root").innerHTML = `

      ${components.header(state)}
      <div class="centered-content">
      ${components.nav(store.links)}
      ${components.main(state)}
      ${components.footer()}
      </div>
    `;
     router.updatePageLinks();
}

router.hooks({
  // We pass in the `done` function to the before hook handler to allow the function to tell Navigo we are finished with the before hook.
  // The `match` parameter is the data that is passed from Navigo to the before hook handler with details about the route being accessed.
  // https://github.com/krasimir/navigo/blob/master/DOCUMENTATION.md#match
  before: (done, match) => {
    console.info("Before hook executing")
    // We need to know what view we are on to know what data to fetch
    const view = match?.data?.view ? camelCase(match.data.view) : "home";
    // Add a switch case statement to handle multiple routes
    switch (view) {
      // New Case for the Home View
    case "profile":
      axios
        // Get request to retrieve the current weather data using the API key and providing a city name
        .get(
          `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.OPEN_WEATHER_MAP_API_KEY}&units=imperial&q=st%20louis`
        )
        .then(response => {
          // Create an object to be stored in the Home state from the response
          store.profile.weather = {
            city: response.data.name,
            temp: response.data.main.temp,
            feelsLike: response.data.main.feels_like,
            description: response.data.weather[0].main
          };
          done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
      break;

      // Add a case for each view that needs data from an API
      case "map":
        // New Axios get request utilizing already made environment variable
        axios
          .get(`http://api.openweathermap.org/geo/1.0/direct?q=Saint Louis, MO, US&limit=1&appid=542793ec2898e42e6e2901f0da39637b`)
          .then(response => {
            // We need to store the response to the state, in the next step but in the meantime let's see what it looks like so that we know what to store from the response.
            console.log("response", response);
            store.map.maps = response.data;

            console.log(store.map.maps)
            done();
          })
          .catch((error) => {
            console.log("It puked", error);
            done();
          });


      default :
        // We must call done for all views so we include default for the views that don't have cases above.
        done();
        // break is not needed since it is the last condition, if you move default higher in the stack then you should add the break statement.
    }
  },


  already: (match) => {
    const view = match?.data?.view ? camelCase(match.data.view) : "home";

    render(store[view]);
  },
  after: (match) => {
    console.info("After hook executing")
    router.updatePageLinks();

  // if (view === map) {
  //   //add eventlistener with axios call for posting data - send to express server -- then to db --for posting
  // }

    // add menu toggle to bars icon in nav bar
    document.querySelector(".fa-bars").addEventListener("click", () => {
        document.querySelector("nav > ul").classList.toggle("hidden--mobile");
    });

    // NEW: add interests limit behavior only for Register view
    const view = match?.data?.view ? camelCase(match.data.view) : "home";
    if (view === "register") {
      setupInterestLimit(); // limit user to selecting max interests
    }
  }
});



router.on({
  "/": () => render(),
  // The :view slot will match any single URL segment that appears directly after the domain name and a slash
  '/:view': function(match) {
    // If URL is '/about-me':
    // match.data.view will be 'about-me'
    // Using Lodash's camelCase to convert kebab-case to camelCase:
    // 'about-me' becomes 'aboutMe'
    const view = match?.data?.view ? camelCase(match.data.view) : "home";

    // If the store import/object has a key named after the view
    if (view in store) {
      // Then the invoke the render function using the view state, using the view name
      render(store[view]);
    } else {
      // If the store
      render(store.viewNotFound);
      console.log(`View ${view} not defined`);
    }
  }
}).resolve();
