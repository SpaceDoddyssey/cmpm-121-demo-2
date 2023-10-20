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

// Create a data structure to define the buttons I'm going to be linking
interface Button {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  func(): void;
  disabled: boolean;
}
const buttons: Button[] = [
  { name: "clearButton", func: clearCanvas, disabled: false },
  { name: "undoButton", func: undo, disabled: true },
  { name: "redoButton", func: redo, disabled: true },
  { name: "exportButton", func: exportDrawing, disabled: false },
  { name: "2pxButton", func: () => setBrush(2), disabled: false },
  { name: "5pxButton", func: () => setBrush(5), disabled: false },
  { name: "10pxButton", func: () => setBrush(10), disabled: false },
  { name: "smileButton", func: () => setBrush("😊"), disabled: false },
  { name: "alienButton", func: () => setBrush("👽"), disabled: false },
  { name: "thumbsupButton", func: () => setBrush("👍"), disabled: false },
];

// Actually link up the buttons
for (const item of buttons) {
  const button = document.getElementById(item.name) as HTMLButtonElement;
  button.addEventListener("click", item.func.bind(this));
  button.disabled = item.disabled;
}

// Set up custom sticker button
const stampButtonDiv = document.getElementById("stampButtonDiv")!;
const customButton = document.getElementById("customButton")!;
customButton.addEventListener("click", promptForStamp);
function promptForStamp() {
  const customText = prompt("Custom sticker text:");
  if (customText == "") {
    return;
  }
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = customText;
  button.addEventListener("click", () => setBrush(customText!));
  stampButtonDiv.append(button);

  console.log(customText);
}

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
  }
}

function stopPath(event: MouseEvent) {
  if (isDrawing) {
    isDrawing = false;

    if (curSticker != "") {
      const newSticker = new Sticker(event.offsetX, event.offsetY, curSticker);
      drawingData.drawables.push(newSticker);
    }
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

// Called when you move the mouse over the canvas, regardless of mouse button status
function moveTool(event: MouseEvent) {
  if (isDrawing && curSticker == "") {
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

function leaveCanvas(event: MouseEvent) {
  if (curSticker == "") {
    stopPath(event);
  }
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

const undoButton = document.getElementById("undoButton") as HTMLButtonElement;
const redoButton = document.getElementById("redoButton") as HTMLButtonElement;
function checkAndEnableButtons() {
  undoButton.disabled = drawingData.drawables.length == 0;
  redoButton.disabled = drawingData.redoList.length == 0;
}

function exportDrawing() {
  // Create a new canvas element
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportContext = exportCanvas.getContext("2d")!;

  // Scale the export context to match the larger canvas
  exportContext.scale(4, 4);
  exportContext.font = "24px serif";

  // Copy over all items on the display list
  for (const item of drawingData.drawables) {
    item.display(exportContext);
  }

  // Convert the export canvas to a data URL
  const exportDataUrl = exportCanvas.toDataURL("image/png");

  // Create a download link and trigger the download
  const downloadLink = document.createElement("a");
  downloadLink.href = exportDataUrl;
  downloadLink.download = "drawing.png";
  downloadLink.click();
}

// Register event listeners for drawing
canvas.addEventListener("mousedown", startPath);
canvas.addEventListener("mousemove", moveTool);
canvas.addEventListener("mouseup", stopPath);
canvas.addEventListener("mouseout", leaveCanvas);
canvas.addEventListener("drawing-changed", redraw);
