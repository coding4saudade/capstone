export function handleRegisterForm() {
  const form = document.getElementById('registerForm');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const selected = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
                          .map(cb => cb.value);
    console.log("Selected interests:", selected);
    // Could call an API here?
  });
}
