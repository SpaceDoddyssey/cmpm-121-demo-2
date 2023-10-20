/* eslint-disable @typescript-eslint/no-magic-numbers */
import { curThickness, curSticker } from "./main.ts";

export class ToolPreview {
  x: number;
  y: number;
  isRendering: boolean;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.isRendering = false;
  }

  display(ctx: CanvasRenderingContext2D) {
    if (!this.isRendering) {
      return;
    }

    if (curSticker != "") {
      ctx.fillText(curSticker, this.x, this.y);
      return;
    }

    renderCircle(ctx, this.x, this.y, curThickness);
  }
}

function renderCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  const thickness = size / 2;
  ctx.strokeStyle = "black";
  ctx.lineWidth = thickness;
  ctx.beginPath();
  ctx.ellipse(x, y, thickness / 2, thickness / 2, 0, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fill();
}

export class Sticker {
  private x: number;
  private y: number;
  private text: string;

  constructor(x: number, y: number, text: string) {
    this.x = x;
    this.y = y;
    this.text = text;
  }

  //Drag is currently never called, but I'm keeping it around in case I need to use it later
  drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.fillText(this.text, this.x, this.y);
  }
}

export class MarkerLine {
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
    //Render a circle at the start of the line
    renderCircle(ctx, this.points[0].x, this.points[0].y, this.thickness);

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

      const lastIndex = this.points.length - 1;
      renderCircle(
        ctx,
        this.points[lastIndex].x,
        this.points[lastIndex].y,
        this.thickness
      );
    }
  }
}

export interface Drawable {
  drag(x: number, y: number): void;
  display(ctx: CanvasRenderingContext2D): void;
}
