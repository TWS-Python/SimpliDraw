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

const setCanvasBackground = (color) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

// Initialize with white background
setCanvasBackground("#ffffff");

// Event Listeners
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  startX = e.offsetX;
  startY = e.offsetY;
});

canvas.addEventListener("mouseup", (e) => {
  if (currentTool === "line" || currentTool === "rectangle" || currentTool === "circle") {
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
  setCanvasBackground("#ffffff");
});

setBgColorButton.addEventListener("click", () => {
  setCanvasBackground(bgColorInput.value);
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

// Shape Drawing Function
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
