const grid = document.getElementById("parkGrid");
const buildingCosts = {
  "food-stand": 10,
  "rollercoaster": 20,
  "trex-zone": 30
};

window.addEventListener("DOMContentLoaded", () => {
  const saved = JSON.parse(localStorage.getItem("placedBuildings")) || [];
  saved.forEach((item) => {
    placeBuilding(item.src, item.left + 40, item.top + 40);
    if (item.name) {
      const label = document.createElement("div");
      label.textContent = item.name;
      label.style.position = "absolute";
      label.style.left = `${item.left}px`;
      label.style.top = `${item.top + 80}px`;
      label.style.color = "#fff";
      label.style.fontWeight = "bold";
      label.style.textShadow = "1px 1px #000";
      grid.appendChild(label);
    }
  });
  updateHappiness();
});

document.querySelectorAll(".draggable").forEach((el) => {
  el.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("src", e.target.src);
  });
});

grid.addEventListener("dragover", (e) => {
  e.preventDefault();
});

grid.addEventListener("drop", (e) => {
  e.preventDefault();
  const src = e.dataTransfer.getData("src");
  const buildingName = src.split("/").pop().split(".")[0];
  const cost = buildingCosts[buildingName] || 10;

  let coins = parseInt(localStorage.getItem("coins") || "0");

  if (coins < cost) {
    alert("Not enough coins to place this building!");
    return;
  }

  const x = e.offsetX;
  const y = e.offsetY;

  placeBuilding(src, x, y);

  const customName = prompt("Name your building (optional):");
  if (customName) {
    const label = document.createElement("div");
    label.textContent = customName;
    label.style.position = "absolute";
    label.style.left = `${x - 40}px`;
    label.style.top = `${y + 40}px`;
    label.style.color = "#fff";
    label.style.fontWeight = "bold";
    label.style.textShadow = "1px 1px #000";
    grid.appendChild(label);
  }

  saveBuilding(src, x, y, customName || "");

  // Play placement sound
  document.getElementById("placeSound").play();

  // Deduct coins
  coins -= cost;
  localStorage.setItem("coins", coins.toString());

  updateHappiness();
});

function placeBuilding(src, x, y) {
  const img = document.createElement("img");
  img.src = src;
  img.className = "placed";
  img.style.left = `${x - 40}px`;
  img.style.top = `${y - 40}px`;
  img.style.position = "absolute";
  grid.appendChild(img);
}

function saveBuilding(src, x, y, name) {
  let current = JSON.parse(localStorage.getItem("placedBuildings")) || [];
  current.push({ src, left: x - 40, top: y - 40, name });
  localStorage.setItem("placedBuildings", JSON.stringify(current));
}

function updateHappiness() {
  const buildings = JSON.parse(localStorage.getItem("placedBuildings")) || [];
  const score = Math.min(buildings.length * 10, 100);
  document.getElementById("happinessBar").value = score;
  document.getElementById("happyScore").textContent = `${score}%`;
}

function goBack() {
  window.location.href = "dashboard.html";
}
