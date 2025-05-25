// Global storage object to replace localStorage
const appData = {
  selectedTopics: [],
  notesKeywords: []
};

// Modified function - stores in memory instead of localStorage
function startCustomPractice() {
  const selected = [];
  
  document.querySelectorAll('input[name="topic"]:checked').forEach((box) => {
    const value = box.value.charAt(0).toUpperCase() + box.value.slice(1);
    selected.push(value);
  });
  
  if (selected.length === 0) {
    alert("Please select at least one topic to begin.");
    return;
  }
  
  // Store in memory instead of localStorage
  appData.selectedTopics = selected;
  
  // Show math page instead of navigating
  showMathPage();
}

// Modified function - stores keywords in memory
function processNotes() {
  const fileInput = document.getElementById("notesFile");
  const preview = document.getElementById("notePreview");
  
  if (!fileInput.files.length) {
    alert("Please upload a .txt file with your class notes.");
    return;
  }
  
  const file = fileInput.files[0];
  const reader = new FileReader();
  
  reader.onload = function (event) {
    const text = event.target.result;
    preview.textContent = "✅ Notes uploaded:\n\n" + text;
    
    const keywords = findMathKeywords(text);
    console.log("📘 Keywords found:", keywords);
    
    // Store in memory instead of localStorage
    appData.notesKeywords = keywords;
  };
  
  reader.readAsText(file);
}

// This function remains the same
function findMathKeywords(text) {
  const lower = text.toLowerCase();
  const terms = [
    "addition", "subtraction", "multiplication", "division",
    "area", "perimeter", "fraction", "algebra",
    "equation", "percent", "geometry", "shapes", "volume", "triangle", "square"
  ];
  return terms.filter(term => lower.includes(term));
}

// New function to handle page switching
function showMathPage() {
  // Hide the topic selection page
  document.getElementById('topicSelection').style.display = 'none';
  // Show the math practice page
  document.getElementById('mathPractice').style.display = 'block';
  
  // Initialize the math practice with selected topics
  initializeMathPractice(appData.selectedTopics);
}