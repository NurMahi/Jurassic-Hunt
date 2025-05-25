window.addEventListener("DOMContentLoaded", () => {
  const trex = document.getElementById("trex");
  const roar = document.getElementById("roarSound");
  const welcomeSong = document.getElementById("welcomeSong");
  const form = document.getElementById("signupForm");
  const soundToggle = document.getElementById("soundToggle");

  let musicStarted = false;
  let isMuted = false;

  // Function to play music + roar on first interaction
  const startAudio = () => {
    if (!musicStarted && !isMuted) {
      welcomeSong.play().catch(err => console.log("Blocked by browser:", err));
      roar.play();
      musicStarted = true;
    }
  };

  // Trigger audio on interaction
  document.body.addEventListener("click", startAudio);
  document.body.addEventListener("keydown", startAudio);

  // Sound toggle logic
  soundToggle.addEventListener("click", () => {
    isMuted = !isMuted;

    if (isMuted) {
      welcomeSong.pause();
      roar.pause();
      soundToggle.textContent = "🔇 Sound Off";
    } else {
      welcomeSong.play().catch(err => console.log("Audio won't play until user interacts."));
      roar.play();
      soundToggle.textContent = "🔊 Sound On";
    }
  });

  // Form submit logic
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();

    if (username === "") {
      alert("Please enter your name!");
      return;
    }

    localStorage.setItem("jurassicUser", username);

    // Stop song before leaving
    welcomeSong.pause();
    welcomeSong.currentTime = 0;

    window.location.href = "dashboard.html";
  });
});
