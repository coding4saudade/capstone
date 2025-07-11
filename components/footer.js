import html from "html-literal"

export default () => html` <footer>
  <div class="footer-content">
    <p>&copy; 2025 Connextion — Building community through shared experiences.</p>
    <p>Made with 💙 for people, animals, and the planet.</p>

    <nav class="footer-nav">
      <a href="#about">About</a> |
      <a href="#contact">Contact</a> |
      <a href="#privacy">Privacy Policy</a>
    </nav>

    <div class="social-links">
      <a href="https://www.linkedin.com/in/your-linkedin-handle" target="_blank" aria-label="LinkedIn">
        <i class="fab fa-linkedin fa-lg"></i>
      </a>
      <a href="https://github.com/your-github-username" target="_blank" aria-label="GitHub">
        <i class="fab fa-github fa-lg"></i>
      </a>
    </div>
  </div>
</footer>


`;

