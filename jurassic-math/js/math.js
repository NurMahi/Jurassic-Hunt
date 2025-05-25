let currentQuestion = null;
let coins = parseInt(localStorage.getItem("coins")) || 0;
let score = 0;

window.addEventListener("DOMContentLoaded", () => {
  updateCoinDisplay();
  generateAndDisplayQuestion();
});

function getSelectedTopics() {
  return JSON.parse(localStorage.getItem("selectedTopics")) || ["Addition"];
}

function generateQuestion() {
  const selectedTopics = getSelectedTopics();
  const topic = selectedTopics[Math.floor(Math.random() * selectedTopics.length)];

  let question = "", answer = 0, formula = "", shape = "none";

  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 10) + 1;

  switch (topic) {
    case "Addition":
      question = `What is ${a} + ${b}?`;
      answer = a + b;
      formula = "Addition";
      break;
    case "Subtraction":
      question = `What is ${a + b} - ${a}?`;
      answer = b;
      formula = "Subtraction";
      break;
    case "Multiplication":
      question = `What is ${a} × ${b}?`;
      answer = a * b;
      formula = "Multiplication";
      break;
    case "Division":
      let dividend = a * b;
      question = `What is ${dividend} ÷ ${a}?`;
      answer = b;
      formula = "Division";
      break;
    case "Fractions":
      question = `What is ${a}/10 + ${b}/10?`;
      answer = (a + b) / 10;
      formula = "Fraction Addition";
      break;
    case "Algebra":
      question = `If x = ${a}, what is 2x + ${b}?`;
      answer = 2 * a + b;
      formula = "Algebra";
      break;
    case "Percentages":
      question = `Convert ${a}% to a decimal.`;
      answer = a / 100;
      formula = "Percentage to Decimal";
      break;
    case "Geometry":
      question = `What is the area of a rectangle with length ${a} and width ${b}?`;
      answer = a * b;
      formula = "Area = length × width";
      shape = "rectangle";
      break;
    default:
      question = `What is ${a} + ${b}?`;
      answer = a + b;
      formula = "Addition";
      break;
  }

  return {
    question,
    answer: parseFloat(answer.toFixed(2)),
    formula,
    shape
  };
}

function generateAndDisplayQuestion() {
  currentQuestion = generateQuestion();
  document.getElementById("questionText").textContent = currentQuestion.question;
  document.getElementById("formulaText").textContent = currentQuestion.formula;
  document.getElementById("userAnswer").value = "";
  document.getElementById("feedbackMessage").textContent = "";

  if (currentQuestion.shape === "rectangle" || currentQuestion.shape === "square") {
    document.getElementById("shapeImage").src = `../assets/shapes/${currentQuestion.shape}.png`;
    document.getElementById("shapeImage").style.display = "block";
  } else {
    document.getElementById("shapeImage").style.display = "none";
  }
}

function submitAnswer() {
  const input = document.getElementById("userAnswer").value.trim();
  const feedback = document.getElementById("feedbackMessage");

  if (!input) {
    feedback.textContent = "⚠️ Please enter an answer.";
    return;
  }

  let userAnswer;
  if (input.includes("/")) {
    const parts = input.split("/");
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && Number(parts[1]) !== 0) {
      userAnswer = parseFloat(parts[0]) / parseFloat(parts[1]);
    } else {
      feedback.textContent = "⚠️ Invalid fraction format.";
      return;
    }
  } else {
    userAnswer = parseFloat(input);
    if (isNaN(userAnswer)) {
      feedback.textContent = "⚠️ Please enter a valid number.";
      return;
    }
  }

  const correctAnswer = parseFloat(currentQuestion.answer.toFixed(2));

  if (Math.abs(userAnswer - correctAnswer) < 0.01) {
    feedback.textContent = "✅ Correct!";
    coins += 1;
    score += 1;
    localStorage.setItem("coins", coins);
    updateCoinDisplay();
  } else {
    feedback.textContent = "❌ Try again!";
  }
}

function nextQuestion() {
  generateAndDisplayQuestion();
}

function updateCoinDisplay() {
  document.getElementById("coinCount").textContent = coins;
}
