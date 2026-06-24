const expressionEl = document.querySelector("#expression");
const resultEl = document.querySelector("#result");
const keys = document.querySelectorAll(".key");

let expression = "";
let justCalculated = false;

const operators = ["+", "-", "*", "/"];

function updateDisplay(message = "") {
  expressionEl.textContent = message || formatExpression(expression) || "Ready";
  resultEl.textContent = expression || message ? getPreview() : "0";
}

function formatExpression(value) {
  return value
    .replaceAll("*", "×")
    .replaceAll("/", "÷")
    .replaceAll("-", "−");
}

function getPreview() {
  if (!expression) {
    return "0";
  }

  if (operators.includes(expression.at(-1))) {
    return formatExpression(expression);
  }

  try {
    return formatNumber(evaluateExpression(expression));
  } catch {
    return formatExpression(expression);
  }
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  return Number.parseFloat(value.toFixed(10)).toLocaleString("en-US", {
    maximumFractionDigits: 10
  });
}

function addValue(value) {
  if (justCalculated && !operators.includes(value)) {
    expression = "";
  }

  justCalculated = false;
  const last = expression.at(-1);

  if (value === ".") {
    const currentNumber = expression.split(/[+\-*/]/).at(-1);
    if (currentNumber.includes(".")) {
      return;
    }
    expression += currentNumber ? "." : "0.";
    updateDisplay();
    return;
  }

  if (operators.includes(value)) {
    if (!expression && value !== "-") {
      return;
    }

    if (operators.includes(last)) {
      expression = expression.slice(0, -1) + value;
    } else {
      expression += value;
    }

    updateDisplay();
    return;
  }

  expression += value;
  updateDisplay();
}

function clearCalculator() {
  expression = "";
  justCalculated = false;
  updateDisplay();
}

function deleteLast() {
  expression = expression.slice(0, -1);
  justCalculated = false;
  updateDisplay();
}

function applyPercent() {
  if (!expression || operators.includes(expression.at(-1))) {
    return;
  }

  expression = String(evaluateExpression(expression) / 100);
  justCalculated = true;
  updateDisplay(`${formatExpression(expression)}%`);
}

function calculate() {
  if (!expression || operators.includes(expression.at(-1))) {
    return;
  }

  try {
    const answer = evaluateExpression(expression);
    expressionEl.textContent = formatExpression(expression);
    resultEl.textContent = formatNumber(answer);
    expression = String(answer);
    justCalculated = true;
  } catch {
    expressionEl.textContent = "Invalid expression";
    resultEl.textContent = "Error";
    expression = "";
    justCalculated = false;
  }
}

function evaluateExpression(value) {
  if (!/^[\d+\-*/. ()]+$/.test(value)) {
    throw new Error("Unsupported expression");
  }

  return Function(`"use strict"; return (${value})`)();
}

function handleAction(action) {
  if (action === "clear") {
    clearCalculator();
  }

  if (action === "delete") {
    deleteLast();
  }

  if (action === "percent") {
    applyPercent();
  }

  if (action === "calculate") {
    calculate();
  }
}

keys.forEach((key) => {
  key.addEventListener("click", () => {
    const { value, action } = key.dataset;

    if (value) {
      addValue(value);
    }

    if (action) {
      handleAction(action);
    }
  });
});

document.addEventListener("keydown", (event) => {
  const keyMap = {
    Enter: "calculate",
    "=": "calculate",
    Backspace: "delete",
    Escape: "clear",
    "%": "percent"
  };

  if (/^[0-9+\-*/.]$/.test(event.key)) {
    addValue(event.key);
    animateKey(`[data-value="${CSS.escape(event.key)}"]`);
    return;
  }

  const action = keyMap[event.key];
  if (action) {
    event.preventDefault();
    handleAction(action);
    animateKey(`[data-action="${action}"]`);
  }
});

function animateKey(selector) {
  const key = document.querySelector(selector);
  if (!key) {
    return;
  }

  key.classList.add("is-pressed");
  window.setTimeout(() => key.classList.remove("is-pressed"), 120);
}

updateDisplay();
