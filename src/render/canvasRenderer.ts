import type { Cell, Maze } from '../maze/types';
import {
  CURSOR_INSET,
  CURSOR_SHRINK,
  FADE_PER_MS,
  type MazeStyle,
} from './mazeStyle';

interface DrawMazeOptions {
  style: MazeStyle;
  cursorIndex?: number | null;
  /** Current time in ms; visited cells fade relative to it. */
  now: number;
  devicePixelRatio?: number;
}

/** CSS pixel size of the canvas needed to draw a maze. */
export function getMazeSize(
  { columns, rows }: Pick<Maze, 'columns' | 'rows'>,
  { cellSize, borderWeight }: Pick<MazeStyle, 'cellSize' | 'borderWeight'>
) {
  return {
    width: cellSize * columns + 2 * borderWeight,
    height: cellSize * rows + 2 * borderWeight,
  };
}

/**
 * Redraws the whole maze. The canvas backing store is expected to be
 * `cssSize * devicePixelRatio`; drawing happens in CSS pixels.
 */
export function drawMaze(
  ctx: CanvasRenderingContext2D,
  maze: Maze,
  { style, cursorIndex = null, now, devicePixelRatio = 1 }: DrawMazeOptions
) {
  ctx.save();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.lineWidth = style.borderWeight;

  for (const cell of maze.cells) {
    drawFill(ctx, cell, cell.index === cursorIndex, style, now);
    drawWalls(ctx, cell, style);
  }

  ctx.restore();
}

function getOrigin(
  { row, column }: Cell,
  { cellSize, borderWeight }: MazeStyle
) {
  return {
    x: column * cellSize + borderWeight,
    y: row * cellSize + borderWeight,
  };
}

function visitedColor({ visitedRgb }: MazeStyle, alpha: number) {
  return `rgba(${visitedRgb}, ${alpha})`;
}

function getFillColor(cell: Cell, style: MazeStyle, now: number) {
  switch (true) {
    case cell.blocked:
      return style.borderColor;
    case cell.backtracked:
      return style.backtrackColor;
    case cell.visited: {
      // Slowly fade out visited cells until they are backtracked.
      const decay =
        cell.lastVisitedAt === null
          ? 0
          : (now - cell.lastVisitedAt) * FADE_PER_MS;
      return visitedColor(style, style.visitedAlpha - decay);
    }
    default:
      return style.unvisitedColor;
  }
}

function drawFill(
  ctx: CanvasRenderingContext2D,
  cell: Cell,
  isCursor: boolean,
  style: MazeStyle,
  now: number
) {
  const { borderWeight, cellSize } = style;
  const { x, y } = getOrigin(cell, style);
  const fillX = x + 0.5 * borderWeight;
  const fillY = y + 0.5 * borderWeight;

  if (isCursor && !cell.blocked) {
    ctx.fillStyle = visitedColor(style, style.visitedAlpha);
    ctx.fillRect(fillX, fillY, cellSize, cellSize);
    ctx.fillStyle = style.cursorColor;
    ctx.fillRect(
      fillX + CURSOR_INSET,
      fillY + CURSOR_INSET,
      cellSize - CURSOR_SHRINK,
      cellSize - CURSOR_SHRINK
    );
    return;
  }

  ctx.fillStyle = getFillColor(cell, style, now);
  ctx.fillRect(fillX, fillY, cellSize, cellSize);
}

function drawWalls(
  ctx: CanvasRenderingContext2D,
  cell: Cell,
  style: MazeStyle
) {
  if (cell.blocked) {
    return;
  }

  const { cellSize: size } = style;
  const { x, y } = getOrigin(cell, style);
  const { walls, edges } = cell;
  const color = (side: keyof typeof edges) =>
    edges[side] ? style.edgeColor : style.borderColor;

  if (walls.Top) {
    line(ctx, x, y, x + size, y, color('Top'));
  }
  // The end cell's right wall is the maze exit.
  if (walls.Right && !cell.isEnd) {
    line(ctx, x + size, y, x + size, y + size, color('Right'));
  }
  if (walls.Bottom) {
    line(ctx, x, y + size, x + size, y + size, color('Bottom'));
  }
  // The start cell's left wall is the maze entrance.
  if (walls.Left && !cell.isStart) {
    line(ctx, x, y, x, y + size, color('Left'));
  }
}

function line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string
) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
