const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

const brushColorInput = document.getElementById("brushColor");
const brushSizeInput = document.getElementById("brushSize");
const bgColorInput = document.getElementById("bgColor");
const setBgColorButton = document.getElementById("setBgColor");
const toolSelector = document.getElementById("tool");
const clearCanvasButton = document.getElementById("clearCanvas");
const downloadCanvasButton = document.getElementById("downloadCanvas");

const addLayerButton = document.getElementById("addLayer");
const deleteLayerButton = document.getElementById("deleteLayer");
const layerSelector = document.getElementById("layerSelector");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 50;

let isDrawing = false;
let startX, startY;
let currentTool = "brush";
let layers = [];
let activeLayerIndex = 0;

// Add initial layer
addLayer();

// Set initial background color
let backgroundColor = "#ffffff";
setCanvasBackground(backgroundColor);

function setCanvasBackground(color) {
  backgroundColor = color;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

canvas.addEventListener("mousedown", (e) => {
  if (currentTool === "text") {
    addTextInput(e.offsetX, e.offsetY);
    return;
  }

  isDrawing = true;
  startX = e.offsetX;
  startY = e.offsetY;

  // Save state before drawing
  saveState();
});

canvas.addEventListener("mouseup", (e) => {
  if (["line", "rectangle", "circle", "bucket"].includes(currentTool)) {
    drawShapeOrFill(e.offsetX, e.offsetY);
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

function addLayer() {
  const newLayer = document.createElement("canvas");
  newLayer.width = canvas.width;
  newLayer.height = canvas.height;
  newLayer.ctx = newLayer.getContext("2d");
  layers.push(newLayer);

  const layerOption = document.createElement("option");
  layerOption.textContent = `Layer ${layers.length}`;
  layerOption.value = layers.length - 1;
  layerSelector.appendChild(layerOption);

  layerSelector.value = layers.length - 1;
  activeLayerIndex = layers.length - 1;
  updateCanvas();
}

function deleteLayer() {
  if (layers.length === 1) {
    alert("You must have at least one layer.");
    return;
  }

  layers.splice(activeLayerIndex, 1);
  layerSelector.removeChild(layerSelector.lastChild);
  activeLayerIndex = Math.max(0, activeLayerIndex - 1);
  layerSelector.value = activeLayerIndex;
  updateCanvas();
}

function updateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  layers.forEach((layer) => {
    ctx.drawImage(layer, 0, 0);
  });
}

function addTextInput(x, y) {
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.style.position = "absolute";
  textInput.style.left = `${x}px`;
  textInput.style.top = `${y}px`;
  textInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      ctx.fillStyle = brushColorInput.value;
      ctx.fillText(textInput.value, x, y);
      document.body.removeChild(textInput);
    }
  });
  document.body.appendChild(textInput);
}
