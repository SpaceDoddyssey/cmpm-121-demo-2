/* eslint-disable @typescript-eslint/no-magic-numbers */
import "./style.css";

import { ToolPreview, MarkerLine, Sticker, Drawable } from "./renderObjects.ts";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Cameron's Paint Game";
document.title = gameName;
const header = document.createElement("h1");
header.innerHTML = gameName;
app.prepend(header);

const canvas = document.getElementById("drawingCanvas") as HTMLCanvasElement;
const context = canvas.getContext("2d")!;
context.textAlign = "center";
context.font = "24px serif";

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
twoPxButton.addEventListener("click", () => setBrush(2));
const fivePxButton = document.getElementById("5pxButton") as HTMLButtonElement;
fivePxButton.addEventListener("click", () => setBrush(5));
const tenPxButton = document.getElementById("10pxButton") as HTMLButtonElement;
tenPxButton.addEventListener("click", () => setBrush(10));

const smileButton = document.getElementById("smileButton") as HTMLButtonElement;
smileButton.addEventListener("click", () => setBrush("😊"));
const alienButton = document.getElementById("alienButton") as HTMLButtonElement;
alienButton.addEventListener("click", () => setBrush("👽"));
const thumbsupButton = document.getElementById(
  "thumbsupButton"
) as HTMLButtonElement;
thumbsupButton.addEventListener("click", () => setBrush("👍"));

let isDrawing = false;
export let curThickness = 5;
export let curSticker = "";

function setBrush(arg: number | string) {
  if (typeof arg === "number") {
    curSticker = "";
    curThickness = arg;
  } else if (typeof arg === "string") {
    curSticker = arg;
    curThickness = 0;
  }
}

// Define an interface to store drawing data
interface DrawingData {
  drawables: Drawable[];
  redoList: Drawable[];
}

// Array to store user's drawing data
const drawingData: DrawingData = { drawables: [], redoList: [] };
const toolPreview: ToolPreview = new ToolPreview(0, 0);

// Start a new path
function startPath(event: MouseEvent) {
  isDrawing = true;
  if (curSticker == "") {
    const newMarkerLine = new MarkerLine(
      event.offsetX,
      event.offsetY,
      curThickness
    );
    drawingData.drawables.push(newMarkerLine);
  } else {
    const newSticker = new Sticker(event.offsetX, event.offsetY, curSticker);
    drawingData.drawables.push(newSticker);
  }
}

function stopPath() {
  if (isDrawing) {
    isDrawing = false;
    checkAndEnableButtons();
  }
}

function clearCanvas() {
  drawingData.drawables = [];
  drawingData.redoList = [];
  canvas.dispatchEvent(
    new CustomEvent<DrawingData>("drawing-changed", {
      detail: { drawables: [], redoList: [] },
    })
  );
}

// Redraw the user's lines
function redraw() {
  if (drawingData?.drawables) {
    const drawables = drawingData.drawables;
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (const drawable of drawables) {
      drawable.display(context);
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
    const currentDrawable =
      drawingData.drawables[drawingData.drawables.length - 1];
    currentDrawable.drag(event.offsetX, event.offsetY);
    redraw();
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
  if (drawingData.drawables.length > 0) {
    drawingData.redoList.push(drawingData.drawables.pop()!);
    draw();
  }

  checkAndEnableButtons();
}

function redo() {
  console.log("Redo!");
  if (drawingData.redoList.length > 0) {
    drawingData.drawables.push(drawingData.redoList.pop()!);
    draw();
  }

  checkAndEnableButtons();
}

function checkAndEnableButtons() {
  undoButton.disabled = drawingData.drawables.length == 0;
  redoButton.disabled = drawingData.redoList.length == 0;
}

// Register event listeners for drawing
canvas.addEventListener("mousedown", startPath);
canvas.addEventListener("mousemove", moveTool);
canvas.addEventListener("mouseup", stopPath);
canvas.addEventListener("mouseout", leaveCanvas);
canvas.addEventListener("drawing-changed", redraw);
