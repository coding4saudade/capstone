const interestForm = document.querySelector("#interestForm");

if (interestForm) {
  interestForm.addEventListener("submit", event => {
    event.preventDefault();

    const selectedInterests = Array.from(
      interestForm.querySelectorAll("input[name='interests']:checked")
    ).map(input => input.value);

    const userId = store.session.user._id;

    axios
      .put(`http://localhost:4000/users/${userId}`, {
        interests: selectedInterests
      })
      .then(response => {
        console.log(" Interests updated:", response.data);
        store.session.user = response.data;
        localStorage.setItem("sessionUser", JSON.stringify(response.data));
        showPopup("Interests updated!");
        router.navigate(`/userHome/${userId}`);
      })
      .catch(err => {
        console.error(" Error updating interests:", err);
        alert("Failed to update interests. Please try again.");
      });
  });
}
