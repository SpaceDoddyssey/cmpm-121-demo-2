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

const twoPxButton = document.getElementById("2pxButton") as HTMLButtonElement;
twoPxButton.addEventListener("click", () => (curThickness = 2));
const fivePxButton = document.getElementById("5pxButton") as HTMLButtonElement;
fivePxButton.addEventListener("click", () => (curThickness = 5));
const tenPxButton = document.getElementById("10pxButton") as HTMLButtonElement;
tenPxButton.addEventListener("click", () => (curThickness = 10));

let isDrawing = false;
let curThickness = 5;

class ToolPreview {
  x: number;
  y: number;
  isRendering: boolean;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.isRendering = false;
  }
  display(ctx: CanvasRenderingContext2D) {
    if (this.isRendering) {
      ctx.strokeStyle = "black";
      ctx.lineWidth = curThickness / 2;
      ctx.beginPath();
      ctx.ellipse(
        this.x,
        this.y,
        curThickness / 4,
        curThickness / 4,
        0,
        0,
        2 * Math.PI
      );
      ctx.stroke();

      // Fill the circle
      ctx.fill();
    }
  }
}

class MarkerLine {
  private points: { x: number; y: number }[] = [];
  private thickness;

  constructor(initialX: number, initialY: number, thickness: number) {
    this.points.push({ x: initialX, y: initialY });
    this.thickness = thickness;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length > 1) {
      ctx.strokeStyle = "black";
      ctx.lineJoin = "round";
      ctx.lineWidth = this.thickness;

      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);
      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }
      ctx.stroke();
    }
  }
}

// Define an interface to store drawing data
interface DrawingData {
  paths: MarkerLine[];
  redoList: MarkerLine[];
}

// Array to store user's drawing data
const drawingData: DrawingData = { paths: [], redoList: [] };
const toolPreview: ToolPreview = new ToolPreview(0, 0);

// Start a new path
function startPath(event: MouseEvent) {
  isDrawing = true;
  const newMarkerLine = new MarkerLine(
    event.offsetX,
    event.offsetY,
    curThickness
  );
  drawingData.paths.push(newMarkerLine);
}

function stopPath() {
  if (isDrawing) {
    isDrawing = false;
    checkAndEnableButtons();
  }
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
function redraw() {
  if (drawingData?.paths) {
    const paths = drawingData.paths;
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (const path of paths) {
      path.display(context);
    }
  }

  toolPreview.display(context);

  checkAndEnableButtons();
}

function draw() {
  canvas.dispatchEvent(new CustomEvent("drawing-changed"));
}

function moveTool(event: MouseEvent) {
  if (isDrawing) {
    const currentPath = drawingData.paths[drawingData.paths.length - 1];
    currentPath.drag(event.offsetX, event.offsetY);
    draw();
    return;
  }

  toolPreview.x = event.offsetX;
  toolPreview.y = event.offsetY;
  toolPreview.isRendering = true;

  redraw();
}

function leaveCanvas() {
  stopPath();
  toolPreview.isRendering = false;
  redraw();
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

// Register event listeners for drawing
canvas.addEventListener("mousedown", startPath);
canvas.addEventListener("mousemove", moveTool);
canvas.addEventListener("mouseup", stopPath);
canvas.addEventListener("mouseout", leaveCanvas);
canvas.addEventListener("drawing-changed", redraw);
