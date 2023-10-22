/* eslint-disable @typescript-eslint/no-magic-numbers */
import { curThickness, curSticker, curColor, curRotation } from "./main.ts";

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
      renderText(ctx, curSticker, this.x, this.y, curRotation);
      return;
    }

    renderCircle(ctx, this.x, this.y, curThickness, curColor);
  }
}

function renderText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  rotation: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((Math.PI / 180) * rotation);
  ctx.textAlign = "center";
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function renderCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  const thickness = size / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.beginPath();
  ctx.ellipse(x, y, thickness / 2, thickness / 2, 0, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fill();
}

export class Sticker {
  private x: number;
  private y: number;
  private text: string;
  private rotation: number;

  constructor(x: number, y: number, text: string, rot: number) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.rotation = rot;
  }

  //Drag is currently never called, but I'm keeping it around in case I need to use it later
  drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D) {
    renderText(ctx, this.text, this.x, this.y, this.rotation);
  }
}

export class MarkerLine {
  private points: { x: number; y: number }[] = [];
  private thickness;
  private color;

  constructor(initialX: number, initialY: number, thickness: number) {
    this.points.push({ x: initialX, y: initialY });
    this.thickness = thickness;
    this.color = curColor;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    //Render a circle at the start of the line
    renderCircle(
      ctx,
      this.points[0].x,
      this.points[0].y,
      this.thickness,
      this.color
    );

    if (this.points.length > 1) {
      ctx.strokeStyle = this.color;
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
        this.thickness,
        this.color
      );
    }
  }
}

export interface Drawable {
  drag(x: number, y: number): void;
  display(ctx: CanvasRenderingContext2D): void;
}
