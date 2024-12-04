const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const undoStack = [];
const redoStack = [];

canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.8;

// Set initial states
let isDrawing = false;
let tool = 'brush';
let startX, startY;

// Save the current canvas state for undo/redo
function saveState() {
  undoStack.push(canvas.toDataURL());
  redoStack.length = 0; // Clear redo stack on new actions
}

// Restore canvas state
function restoreState(dataURL) {
  const img = new Image();
  img.src = dataURL;
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
}

// Start drawing
canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  startX = e.offsetX;
  startY = e.offsetY;

  if (tool !== 'brush' && tool !== 'erase') {
    saveState(); // Save state before starting shapes
  }
});

// Stop drawing
canvas.addEventListener('mouseup', (e) => {
  isDrawing = false;

  if (tool !== 'brush' && tool !== 'erase') {
    const endX = e.offsetX;
    const endY = e.offsetY;
    drawShape(startX, startY, endX, endY);
  }

  saveState(); // Save after action
});

// Drawing logic
canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;

  const x = e.offsetX;
  const y = e.offsetY;

  if (tool === 'brush') {
    ctx.lineTo(x, y);
    ctx.stroke();
  } else if (tool === 'erase') {
    ctx.clearRect(x - 10, y - 10, 20, 20); // Erase with a square shape
  }
});

// Draw shapes: line, rectangle, circle
function drawShape(x1, y1, x2, y2) {
  ctx.beginPath();

  if (tool === 'line') {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  } else if (tool === 'rectangle') {
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    ctx.stroke();
  } else if (tool === 'circle') {
    const radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    ctx.arc(x1, y1, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// Button event listeners
document.querySelectorAll('button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    tool = btn.id.replace('Tool', '').toLowerCase();
  });
});

// Undo and Redo actions
document.getElementById('undo').addEventListener('click', () => {
  if (undoStack.length > 0) {
    redoStack.push(undoStack.pop());
    restoreState(undoStack[undoStack.length - 1] || null);
  }
});

document.getElementById('redo').addEventListener('click', () => {
  if (redoStack.length > 0) {
    const state = redoStack.pop();
    undoStack.push(state);
    restoreState(state);
  }
});

// Clear canvas button
document.getElementById('clearCanvas').addEventListener('click', () => {
  saveState();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Set brush/erase styles
ctx.lineWidth = 5;
ctx.lineCap = 'round';
ctx.strokeStyle = 'black';

// Set initial state
saveState();
