import Navigo from "navigo";

// Minimal store with a createUser view object
export const store = {
  home: { view: "home" },
  createUser: {
    view: "createUser",
    create: "Create an Account"
  }
};

// Router instance
const router = new Navigo("/");
window.router = router; // helpful for debugging in console

// Render function
function render(state = store.home) {
  console.log("🧠 render called with state:", state);
  console.log("🧠 state.view:", state?.view);

  const root = document.querySelector("#root");

  if (!root) {
    console.error("❌ #root element not found in DOM");
    return;
  }

  // Minimal content for now
  if (state.view === "createUser") {
    console.log("✅ createUser logic running");

    root.innerHTML = `
      <h2>Create Account</h2>
      <form id="registerForm">
        <label for="username">Username:</label><br />
        <input type="text" id="username" name="username" required /><br /><br />

        <label for="email">Email:</label><br />
        <input type="email" id="email" name="email" required /><br /><br />

        <label for="startingAddress">Starting Address:</label><br />
        <input type="text" id="startingAddress" name="startingAddress" required /><br /><br />

        <fieldset>
          <legend>Select Interests:</legend>
          <label><input type="checkbox" name="interests" value="sports" /> Sports</label><br />
          <label><input type="checkbox" name="interests" value="music" /> Music</label><br />
        </fieldset><br />

        <button type="submit">Register</button>
      </form>
    `;

    const registerForm = document.querySelector("#registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", event => {
        event.preventDefault();
        const formData = new FormData(registerForm);
        const newUser = {
          username: formData.get("username"),
          email: formData.get("email"),
          startingAddress: formData.get("startingAddress"),
          interests: formData.getAll("interests")
        };

        console.log("📨 Submitting new user:", newUser);
        alert("Mock user created!");
        router.navigate("/"); // redirect back to home
      });
    }
  } else {
    root.innerHTML = `<h1>Home</h1><a href="/createUser" data-navigo>Create Account</a>`;
  }

  router.updatePageLinks();
}

// Router config
router.on({
  "/": () => {
    console.log("🏠 Navigating to home");
    render(store.home);
  },
  "/createUser": () => {
    console.log("📍 Navigating to createUser");
    render(store.createUser);
  }
});

router.resolve();
