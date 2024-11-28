const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions to fill the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 50; // Adjust for toolbar height

// Variables for drawing state
let drawing = false;
let brushColor = "#000000";
let brushSize = 5;

// Update brush color and size from toolbar
document.getElementById("colorPicker").addEventListener("input", (e) => {
  brushColor = e.target.value;
});

document.getElementById("brushSize").addEventListener("input", (e) => {
  brushSize = e.target.value;
});

// Start drawing on mouse down
canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.clientX, e.clientY - canvas.offsetTop);
});

// Draw on mouse move
canvas.addEventListener("mousemove", (e) => {
  if (drawing) {
    ctx.lineTo(e.clientX, e.clientY - canvas.offsetTop);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.stroke();
  }
});

// Stop drawing on mouse up or mouse out
canvas.addEventListener("mouseup", () => {
  drawing = false;
});
canvas.addEventListener("mouseout", () => {
  drawing = false;
});

// Clear the canvas
document.getElementById("clearCanvas").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Download the canvas as an image
document.getElementById("downloadImage").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "drawing.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
