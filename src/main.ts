import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Cameron's Paint Game";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.prepend(header);

const canvas = document.getElementById("drawingCanvas") as HTMLCanvasElement;
const context = canvas.getContext("2d");

// Variables to track the drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Function to start drawing
function startDrawing(event: MouseEvent) {
  isDrawing = true;
  [lastX, lastY] = [event.offsetX, event.offsetY];
}

// Function to draw lines
function draw(event: MouseEvent) {
  if (!isDrawing) return;

  context!.strokeStyle = "black";
  context!.lineJoin = "round";
  context!.lineWidth = 5;

  context!.beginPath();
  context!.moveTo(lastX, lastY);
  context!.lineTo(event.offsetX, event.offsetY);
  context!.stroke();

  [lastX, lastY] = [event.offsetX, event.offsetY];
}

// Function to stop drawing
function stopDrawing() {
  isDrawing = false;
}

// Register event listeners
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

function clearCanvas() {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  context?.clearRect(0, 0, canvas.width, canvas.height);
}

// Add a click event listener to the "Clear" button
const clearButton = document.getElementById("clearButton") as HTMLButtonElement;
clearButton.addEventListener("click", clearCanvas);
