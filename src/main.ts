/* eslint-disable @typescript-eslint/no-magic-numbers */
import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Cameron's Paint Game";
document.title = gameName;
const header = document.createElement("h1");
header.innerHTML = gameName;
app.prepend(header);

const canvas = document.getElementById("drawingCanvas") as HTMLCanvasElement;
const context = canvas.getContext("2d")!;

// Add a click event listener to the "Clear" button
const clearButton = document.getElementById("clearButton") as HTMLButtonElement;
clearButton.addEventListener("click", clearCanvas);

let isDrawing = false;

// Define an interface to store drawing data
interface DrawingData {
  paths: { x: number; y: number }[][];
}

// Array to store user's drawing data
const drawingData: DrawingData = { paths: [] };
let currentPath: { x: number; y: number }[] = [];

// Start a new path
function startPath(event: MouseEvent) {
  isDrawing = true;
  currentPath = [];
  currentPath.push({ x: event.offsetX, y: event.offsetY });
}

// Add a point to the current path
function addPoint(event: MouseEvent) {
  if (isDrawing) {
    currentPath.push({ x: event.offsetX, y: event.offsetY });
    const data = {
      paths: drawingData.paths.concat([currentPath]),
    };
    canvas.dispatchEvent(new CustomEvent("drawing-changed", { detail: data }));
  }
}

// Stop the current path
function stopPath() {
  if (isDrawing) {
    isDrawing = false;
    if (currentPath.length > 0) {
      drawingData.paths.push(currentPath);
      currentPath = [];
    }
  }
}

// Clear the canvas
function clearCanvas() {
  drawingData.paths.length = 0;
  canvas.dispatchEvent(
    new CustomEvent<DrawingData>("drawing-changed", { detail: { paths: [] } })
  );
}

// Function to redraw the user's lines
function redraw(event: CustomEvent) {
  const paths = (event.detail as DrawingData).paths;
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (const path of paths) {
    if (path.length > 1) {
      context.strokeStyle = "black";
      context.lineJoin = "round";
      context.lineWidth = 5;

      context.beginPath();
      context.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        context.lineTo(path[i].x, path[i].y);
      }
      context.stroke();
    }
  }
}

// Register event listeners
canvas.addEventListener("mousedown", startPath);
canvas.addEventListener("mousemove", addPoint);
canvas.addEventListener("mouseup", stopPath);
canvas.addEventListener("mouseout", stopPath);
canvas.addEventListener("drawing-changed", redraw as EventListener);
clearButton.addEventListener("click", clearCanvas);
