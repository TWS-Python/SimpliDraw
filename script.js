const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

const brushColorInput = document.getElementById("brushColor");
const brushSizeInput = document.getElementById("brushSize");
const bgColorInput = document.getElementById("bgColor");
const setBgColorButton = document.getElementById("setBgColor");
const toolSelector = document.getElementById("tool");
const clearCanvasButton = document.getElementById("clearCanvas");
const downloadCanvasButton = document.getElementById("downloadCanvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 50;

let isDrawing = false;
let startX, startY;
let currentTool = "brush";
let drawingHistory = [];
let redoStack = [];

// Set initial background color
let backgroundColor = "#ffffff";
setCanvasBackground(backgroundColor);

function setCanvasBackground(color) {
  backgroundColor = color;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  startX = e.offsetX;
  startY = e.offsetY;

  // Save state before drawing
  saveState();
});

canvas.addEventListener("mouseup", (e) => {
  if (["line", "rectangle", "circle"].includes(currentTool)) {
    drawShape(e.offsetX, e.offsetY);
  }
  isDrawing = false;
  ctx.beginPath();
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing || currentTool !== "brush") return;

  ctx.lineWidth = brushSizeInput.value;
  ctx.strokeStyle = brushColorInput.value;
  ctx.lineCap = "round";

  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

clearCanvasButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setCanvasBackground(backgroundColor);
  saveState();
});

setBgColorButton.addEventListener("click", () => {
  setCanvasBackground(bgColorInput.value);
  saveState();
});

downloadCanvasButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "simplidraw.png";
  link.href = canvas.toDataURL();
  link.click();
});

toolSelector.addEventListener("change", (e) => {
  currentTool = e.target.value;
});

function drawShape(endX, endY) {
  ctx.lineWidth = brushSizeInput.value;
  ctx.strokeStyle = brushColorInput.value;

  const width = endX - startX;
  const height = endY - startY;

  switch (currentTool) {
    case "line":
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.closePath();
      break;
    case "rectangle":
      ctx.beginPath();
      ctx.strokeRect(startX, startY, width, height);
      ctx.closePath();
      break;
    case "circle":
      const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
      ctx.beginPath();
      ctx.arc(startX + width / 2, startY + height / 2, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
      break;
  }
}

// Undo/Redo Functionality
function saveState() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  drawingHistory.push(imageData);
  redoStack = [];
}

function undo() {
  if (drawingHistory.length > 0) {
    redoStack.push(drawingHistory.pop());
    restoreState();
  }
}

function redo() {
  if (redoStack.length > 0) {
    drawingHistory.push(redoStack.pop());
    restoreState();
  }
}

function restoreState() {
  ctx.putImageData(drawingHistory[drawingHistory.length - 1], 0, 0);
}

// Keyboard Shortcuts
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "z") undo();
  if (e.ctrlKey && e.key === "y") redo();
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    downloadCanvasButton.click();
  }
  if (e.ctrlKey && e.shiftKey && e.key === "c") {
    clearCanvasButton.click();
  }
});

// Resize Canvas
window.addEventListener("resize", () => {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.drawImage(canvas, 0, 0);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 50;

  setCanvasBackground(backgroundColor);
  ctx.drawImage(tempCanvas, 0, 0);
});
