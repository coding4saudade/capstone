export function setupInterestLimit(maxAllowed = 10) {
  const checkboxes = document.querySelectorAll('input[name="interests"]');
  if (!checkboxes.length) return; // exit if no interests on this view

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const checked = document.querySelectorAll('input[name="interests"]:checked');
      if (checked.length > maxAllowed) {
        checkbox.checked = false;
        alert(`You can select up to ${maxAllowed} interests only.`);
      }
    });
  });
}
