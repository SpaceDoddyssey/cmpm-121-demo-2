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

// Add a click event listener to the "Undo" button
const undoButton = document.getElementById("undoButton") as HTMLButtonElement;
undoButton.addEventListener("click", undo);
undoButton.disabled = true;

// Add a click event listener to the "Redo" button
const redoButton = document.getElementById("redoButton") as HTMLButtonElement;
redoButton.addEventListener("click", redo);
redoButton.disabled = true;

let isDrawing = false;

// Define an interface to store drawing data
interface DrawingData {
  paths: { x: number; y: number }[][];
  redoList: { x: number; y: number }[][];
}

// Array to store user's drawing data
const drawingData: DrawingData = { paths: [], redoList: [] };
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
    draw();
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

  checkAndEnableButtons();
}

// Clear the canvas
function clearCanvas() {
  drawingData.paths = [];
  drawingData.redoList = [];
  canvas.dispatchEvent(
    new CustomEvent<DrawingData>("drawing-changed", {
      detail: { paths: [], redoList: [] },
    })
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

  checkAndEnableButtons();
}

function undo() {
  console.log("Undo!");
  if (drawingData.paths.length > 0) {
    drawingData.redoList.push(drawingData.paths.pop()!);
    draw();
  }

  checkAndEnableButtons();
}

function redo() {
  console.log("Redo!");
  if (drawingData.redoList.length > 0) {
    drawingData.paths.push(drawingData.redoList.pop()!);
    draw();
  }

  checkAndEnableButtons();
}

function checkAndEnableButtons() {
  undoButton.disabled = drawingData.paths.length == 0;
  redoButton.disabled = drawingData.redoList.length == 0;
}

function draw() {
  const data = {
    paths: drawingData.paths.concat([currentPath]),
  };
  canvas.dispatchEvent(new CustomEvent("drawing-changed", { detail: data }));
}

// Register event listeners for drawing
canvas.addEventListener("mousedown", startPath);
canvas.addEventListener("mousemove", addPoint);
canvas.addEventListener("mouseup", stopPath);
canvas.addEventListener("mouseout", stopPath);
canvas.addEventListener("drawing-changed", redraw as EventListener);
