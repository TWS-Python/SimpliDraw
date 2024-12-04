const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

const toolSelector = document.getElementById("tool");
const brushColor = document.getElementById("brushColor");
const brushSize = document.getElementById("brushSize");
const backgroundColorInput = document.getElementById("backgroundColor");
const applyBackgroundButton = document.getElementById("applyBackground");
const undoButton = document.getElementById("undo");
const redoButton = document.getElementById("redo");
const clearCanvasButton = document.getElementById("clearCanvas");
const downloadCanvasButton = document.getElementById("downloadCanvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 50;

let isDrawing = false;
let startX = 0, startY = 0;
let currentTool = "brush";
let strokes = [];
let redoStack = [];

// ** Update Tool **
toolSelector.addEventListener("change", () => {
  currentTool = toolSelector.value;
});

// ** Background Color Change **
applyBackgroundButton.addEventListener("click", () => {
  ctx.fillStyle = backgroundColorInput.value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  strokes.push({ type: "background", color: backgroundColorInput.value });
  redoStack = [];
});

// ** Start Drawing **
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  startX = e.offsetX;
  startY = e.offsetY;

  if (currentTool === "brush" || currentTool === "eraser") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    strokes.push({
      type: currentTool,
      color: currentTool === "eraser" ? backgroundColorInput.value : brushColor.value,
      size: brushSize.value,
      path: [[startX, startY]],
    });
  }
});

// ** Draw or Use Tools **
canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;

  const x = e.offsetX;
  const y = e.offsetY;

  if (currentTool === "brush" || currentTool === "eraser") {
    ctx.strokeStyle = currentTool === "eraser" ? backgroundColorInput.value : brushColor.value;
    ctx.lineWidth = brushSize.value;
    ctx.lineTo(x, y);
    ctx.stroke();

    const currentStroke = strokes[strokes.length - 1];
    currentStroke.path.push([x, y]);
  }
});

canvas.addEventListener("mouseup", (e) => {
  isDrawing = false;
  const x = e.offsetX;
  const y = e.offsetY;

  if (currentTool === "line") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath();
    strokes.push({ type: "line", color: brushColor.value, size: brushSize.value, startX, startY, endX: x, endY: y });
  } else if (currentTool === "rectangle") {
    ctx.beginPath();
    ctx.rect(startX, startY, x - startX, y - startY);
    ctx.stroke();
    ctx.closePath();
    strokes.push({ type: "rectangle", color: brushColor.value, size: brushSize.value, startX, startY, width: x - startX, height: y - startY });
  } else if (currentTool === "circle") {
    ctx.beginPath();
    const radius = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
    ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
    strokes.push({ type: "circle", color: brushColor.value, size: brushSize.value, startX, startY, radius });
  }
});

// ** Undo/Redo Functionality **
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

// ** Clear Canvas **
clearCanvasButton.addEventListener("click", () => {
  strokes = [];
  redoStack = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// ** Download Canvas as Image **
downloadCanvasButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "drawing.png";
  link.href = canvas.toDataURL();
  link.click();
});

// ** Redraw Canvas **
function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  strokes.forEach((stroke) => {
    if (stroke.type === "background") {
      ctx.fillStyle = stroke.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (stroke.type === "line") {
      ctx.beginPath();
      ctx.moveTo(stroke.startX, stroke.startY);
      ctx.lineTo(stroke.endX, stroke.endY);
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.stroke();
      ctx.closePath();
    } else if (stroke.type === "rectangle") {
      ctx.beginPath();
      ctx.rect(stroke.startX, stroke.startY, stroke.width, stroke.height);
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.stroke();
      ctx.closePath();
    } else if (stroke.type === "circle") {
      ctx.beginPath();
      ctx.arc(stroke.startX, stroke.startY, stroke.radius, 0, 2 * Math.PI);
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.stroke();
      ctx.closePath();
    } else if (stroke.type === "brush" || stroke.type === "eraser") {
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      stroke.path.forEach(([x, y], index) => {
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.closePath();
    }
  });
}
