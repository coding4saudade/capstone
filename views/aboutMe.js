
import html from "html-literal";
import dogWithFlower from "url:../assets/img/dog-with-flower.jpg";

export default () => html`
  <section id="bio">
    <div class="bio-container">
      <div class="bio-image">
        <img src="${dogWithFlower}" alt="me" />
      </div>

      <div class="bio-text">
        <h2>
          "Technology is best when it brings people together."<br />
          — Matt Mullenweg
        </h2>

        <p>
          I believe that strong communities are built when we share our skills,
          support one another, and stay connected to the land and each other.
          My journey began with gardening, then grew into home remodeling and
          tiny house building—hands-on ways to meet real needs. Along the way, I
          worked alongside local food banks, making and hosting community
          dinners to help those facing food insecurity.
        </p>

        <p>
          But I realized that not every challenge can be solved with a hammer
          and shovel. Some require new tools—like code. I'm learning to build
          software that lifts people up: applications that connect, empower, and
          educate. Whether it’s helping someone learn a new skill, access
          resources, or find their footing, my goal is to use technology as a
          force for good—for people, animals, and the planet.
        </p>

        <h2>Want to say hi?</h2>
        <p>
          Email me at
          <a href="mailto:info@coding4saudade.com">info@coding4saudade.com</a>
        </p>
      </div>
    </div>
  </section>
`;
