const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

const toolSelector = document.getElementById("tool");
const brushColor = document.getElementById("brushColor");
const brushSize = document.getElementById("brushSize");
const backgroundColorInput = document.getElementById("backgroundColor");
const clearCanvasButton = document.getElementById("clearCanvas");
const undoButton = document.getElementById("undo");
const redoButton = document.getElementById("redo");
const downloadCanvasButton = document.getElementById("downloadCanvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 60;

let isDrawing = false;
let startX = 0, startY = 0;
let currentTool = "brush";
let strokes = [];
let redoStack = [];

// Apply initial background color
ctx.fillStyle = backgroundColorInput.value;
ctx.fillRect(0, 0, canvas.width, canvas.height);

toolSelector.addEventListener("change", () => {
  currentTool = toolSelector.value;
});

backgroundColorInput.addEventListener("input", () => {
  ctx.fillStyle = backgroundColorInput.value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  strokes.push({ type: "background", color: backgroundColorInput.value });
  redoStack = [];
});

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  startX = e.offsetX;
  startY = e.offsetY;

  if (currentTool === "brush" || currentTool === "eraser") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.strokeStyle = currentTool === "eraser" ? backgroundColorInput.value : brushColor.value;
    ctx.lineWidth = brushSize.value;
    ctx.lineCap = "round";
    strokes.push({ type: currentTool, path: [[startX, startY]], color: ctx.strokeStyle, size: ctx.lineWidth });
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;

  const x = e.offsetX;
  const y = e.offsetY;

  if (currentTool === "brush" || currentTool === "eraser") {
    ctx.lineTo(x, y);
    ctx.stroke();

    const currentStroke = strokes[strokes.length - 1];
    currentStroke.path.push([x, y]);
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (!isDrawing) return;

  isDrawing = false;

  const endX = e.offsetX;
  const endY = e.offsetY;

  if (currentTool === "line" || currentTool === "rectangle" || currentTool === "circle") {
    const stroke = {
      type: currentTool,
      startX,
      startY,
      endX,
      endY,
      color: brushColor.value,
      size: brushSize.value,
    };
    strokes.push(stroke);
    redoStack = [];
    drawShape(stroke);
  }
});

clearCanvasButton.addEventListener("click", () => {
  strokes = [];
  redoStack = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = backgroundColorInput.value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

undoButton.addEventListener("click", () => {
  if (strokes.length === 0) return;
  redoStack.push(strokes.pop());
  redrawCanvas();
});

redoButton.addEventListener("click", () => {
  if (redoStack.length === 0) return;
  strokes.push(redoStack.pop());
  redrawCanvas();
});

downloadCanvasButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "drawing.png";
  link.href = canvas.toDataURL();
  link.click();
});

function drawShape(stroke) {
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;

  if (stroke.type === "line") {
    ctx.beginPath();
    ctx.moveTo(stroke.startX, stroke.startY);
    ctx.lineTo(stroke.endX, stroke.endY);
    ctx.stroke();
  } else if (stroke.type === "rectangle") {
    const width = stroke.endX - stroke.startX;
    const height = stroke.endY - stroke.startY;
    ctx.strokeRect(stroke.startX, stroke.startY, width, height);
  } else if (stroke.type === "circle") {
    const radius = Math.sqrt(
      Math.pow(stroke.endX - stroke.startX, 2) + Math.pow(stroke.endY - stroke.startY, 2)
    );
    ctx.beginPath();
    ctx.arc(stroke.startX, stroke.startY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = backgroundColorInput.value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  strokes.forEach((stroke) => {
    if (stroke.type === "brush" || stroke.type === "eraser") {
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = "round";
      stroke.path.forEach(([x, y], index) => {
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    } else {
      drawShape(stroke);
    }
  });
}
