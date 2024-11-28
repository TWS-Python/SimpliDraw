const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

const brushColor = document.getElementById("brushColor");
const brushSize = document.getElementById("brushSize");
const toolSelector = document.getElementById("tool");
const clearCanvasButton = document.getElementById("clearCanvas");
const downloadCanvasButton = document.getElementById("downloadCanvas");
const addLayerButton = document.getElementById("addLayer");
const deleteLayerButton = document.getElementById("deleteLayer");
const layerSelector = document.getElementById("layerSelector");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 50;

let isDrawing = false;
let startX = 0, startY = 0;
let currentTool = "brush";
let layers = [];
let activeLayerIndex = 0;

initialize();

// ** Initialize canvas with layers **
function initialize() {
  addLayer();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

// ** Add Layer **
function addLayer() {
  const newLayer = document.createElement("canvas");
  newLayer.width = canvas.width;
  newLayer.height = canvas.height;
  layers.push(newLayer.getContext("2d"));

  const layerOption = document.createElement("option");
  layerOption.value = layers.length - 1;
  layerOption.textContent = `Layer ${layers.length}`;
  layerSelector.appendChild(layerOption);

  layerSelector.value = layers.length - 1;
  activeLayerIndex = layers.length - 1;
  switchLayer();
}

// ** Switch Active Layer **
function switchLayer() {
  const selectedLayerIndex = parseInt(layerSelector.value);
  activeLayerIndex = selectedLayerIndex;
  updateCanvas();
}

// ** Delete Layer **
function deleteLayer() {
  if (layers.length === 1) {
    alert("At least one layer must exist.");
    return;
  }
  layers.splice(activeLayerIndex, 1);
  layerSelector.removeChild(layerSelector.lastChild);
  activeLayerIndex = Math.max(0, activeLayerIndex - 1);
  layerSelector.value = activeLayerIndex;
  updateCanvas();
}

// ** Clear Canvas **
clearCanvasButton.addEventListener("click", () => {
  layers.forEach(layer => layer.clearRect(0, 0, canvas.width, canvas.height));
  updateCanvas();
});

// ** Download Canvas **
downloadCanvasButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "drawing.png";
  link.href = canvas.toDataURL();
  link.click();
});

// ** Canvas Drawing Events **
canvas.addEventListener("mousedown", (e) => {
  startX = e.offsetX;
  startY = e.offsetY;
  isDrawing = true;

  if (currentTool === "text") {
    addText(startX, startY);
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (isDrawing && currentTool !== "brush") {
    drawShape(e.offsetX, e.offsetY);
  }
  isDrawing = false;
  ctx.beginPath();
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing || currentTool !== "brush") return;

  const layer = layers[activeLayerIndex];
  layer.lineWidth = brushSize.value;
  layer.strokeStyle = brushColor.value;

  layer.lineTo(e.offsetX, e.offsetY);
  layer.stroke();
  layer.beginPath();
  layer.moveTo(e.offsetX, e.offsetY);

  updateCanvas();
});

// ** Drawing Shapes **
function drawShape(x, y) {
  const layer = layers[activeLayerIndex];
  layer.strokeStyle = brushColor.value;
  layer.lineWidth = brushSize.value;

  if (currentTool === "line") {
    layer.beginPath();
    layer.moveTo(startX, startY);
    layer.lineTo(x, y);
    layer.stroke();
  } else if (currentTool === "rectangle") {
    layer.strokeRect(startX, startY, x - startX, y - startY);
  } else if (currentTool === "circle") {
    const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
    layer.beginPath();
    layer.arc(startX, startY, radius, 0, Math.PI * 2);
    layer.stroke();
  }
  updateCanvas();
}

// ** Add Text **
function addText(x, y) {
  const text = prompt("Enter text:");
  if (text) {
    const layer = layers[activeLayerIndex];
    layer.font = `${brushSize.value * 5}px Arial`;
    layer.fillStyle = brushColor.value;
    layer.fillText(text, x, y);
    updateCanvas();
  }
}

// ** Paint Bucket Tool **
function fillCanvas(x, y) {
  // Simple paint bucket logic placeholder
  alert("Paint Bucket Tool not implemented yet!");
}

// ** Update Main Canvas **
function updateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  layers.forEach(layer => ctx.drawImage(layer.canvas, 0, 0));
}

// ** Tool Selector **
toolSelector.addEventListener("change", () => {
  currentTool = toolSelector.value;
});

// ** Layer Events **
layerSelector.addEventListener("change", switchLayer);
addLayerButton.addEventListener("click", addLayer);
deleteLayerButton.addEventListener("click", deleteLayer);
