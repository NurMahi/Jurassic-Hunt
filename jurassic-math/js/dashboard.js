// dashboard.js

window.addEventListener("DOMContentLoaded", () => {
  console.log("dashboard.js loaded ✅");

  // Set or get user name
  const user = localStorage.getItem("jurassicUser") || "Explorer";
  document.getElementById("userName").textContent = user;

  // Set coins if not set
  if (!localStorage.getItem("coins")) {
    localStorage.setItem("coins", "10");
  }

  updateCoinDisplay();
  updateXPBar(60); // Set progress
});

function updateCoinDisplay() {
  const coins = localStorage.getItem("coins") || "0";
  document.getElementById("coinNumber").textContent = coins;
}

function updateXPBar(percent) {
  const bar = document.querySelector(".progress-bar");
  if (bar) {
    bar.style.width = percent + "%";
  }
}

// Button actions
function startChallenge() {
  window.location.href = "topic_select.html";
}
function goToBuilder() {
  window.location.href = "builder.html";
}

function viewStats() {
  alert("📊 Stats feature is under construction!");
}
