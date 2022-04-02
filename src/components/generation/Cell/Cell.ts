import { TCell, ICell, Connections, Walls, DirectionIndex } from './types';

export default class Cell implements ICell {
  canvasCtx: any;
  index: number;
  rowIndex: number;
  colIndex: number;
  x: number;
  y: number;
  size: number;
  borderColor: string;
  borderWeight: number;
  cursorColor: string;
  visitedColor: string;
  backtrackColor: string;
  isStart: boolean;
  isMiddle: boolean;
  isEnd: boolean;
  connections: Connections;
  walls: Walls;
  visited: boolean;
  pathId: string;
  isCursor: boolean;
  backtrack: boolean;
  blockedInternal: boolean;
  blockedExternal: boolean;
  isBlocked: boolean;

  constructor({
    canvasCtx,
    index,
    rowIndex,
    colIndex,
    size = 25,
    borderWeight = 2,
    borderColor = 'white',
    cursorColor = 'white',
    visitedColor = 'rgba(0, 0, 0, 0.1)',
    backtrackColor = 'white',
    isStart = false,
    isMiddle = false,
    isEnd = false,
    isBlocked = false,
  }: TCell) {
    this.canvasCtx = canvasCtx;
    this.index = index;

    this.rowIndex = rowIndex;
    this.colIndex = colIndex;
    this.x = this.colIndex * size + borderWeight;
    this.y = this.rowIndex * size + borderWeight;
    this.size = size;
    this.borderColor = borderColor;
    this.borderWeight = borderWeight;
    this.cursorColor = cursorColor;
    this.visitedColor = visitedColor;
    this.backtrackColor = backtrackColor;
    this.isStart = isStart;
    this.isMiddle = isMiddle;
    this.isEnd = isEnd;
    this.isBlocked = isBlocked;

    if (isBlocked) {
      this.blockedInternal = true;
    }

    this.connections = [];

    this.walls = [true, true, true, true];

    this.visited = false;
  }

  getIndex() {
    return this.index;
  }

  getConnections() {
    return this.connections;
  }

  connect(cell: Cell, { mutual } = { mutual: true }) {
    this.connections.push(cell);

    if (cell.rowIndex > this.rowIndex) {
      this.walls[DirectionIndex.SOUTH] = false;
    }

    if (cell.rowIndex < this.rowIndex) {
      this.walls[DirectionIndex.NORTH] = false;
    }

    if (cell.colIndex > this.colIndex) {
      this.walls[DirectionIndex.EAST] = false;
    }

    if (cell.colIndex < this.colIndex) {
      this.walls[DirectionIndex.WEST] = false;
    }

    if (mutual) {
      cell.connect(this, { mutual: false });
    }

    return this;
  }

  disconnect(cell: Cell, { mutual } = { mutual: true }) {
    this.connections = this.connections.filter((c) => c.index === cell.index);

    if (mutual) {
      cell.disconnect(this, { mutual: false });
    }

    return this;
  }

  isIneligible() {
    return this.visited || this.blockedInternal;
  }

  setAsBacktrack() {
    this.backtrack = true;
  }

  setAsVisited() {
    this.visited = true;
  }

  visit(prevCell: Cell, pathId: string) {
    this.pathId = pathId;
    this.visited = true;

    this.setAsCursor();

    if (!this.isStart && !this.isEnd) {
      this.walls = [true, true, true, true];
    }

    if (prevCell) {
      this.connect(prevCell);
    }
    return this;
  }

  setAsCursor() {
    this.isCursor = true;
  }

  unsetAsCursor() {
    this.isCursor = false;
  }

  hasDifferentPathId(cell: Cell) {
    return this.pathId && cell.pathId && this.pathId !== cell.pathId;
  }

  getFillColor() {
    switch (true) {
      case this.blockedExternal:
      case this.blockedInternal:
        return this.borderColor;
      case this.isCursor:
        return this.cursorColor;
      case this.backtrack:
        return this.backtrackColor;
      case this.visited:
        return this.visitedColor;
      default:
        return 'rgba(0,0,0,0)';
    }
  }

  draw() {
    this.clearFill();
    this.drawFill(this.getFillColor());
    this.drawWalls(this.walls);
  }

  clearFill() {
    const fillX = this.x + 0.5 * this.borderWeight;
    const fillY = this.y + 0.5 * this.borderWeight;

    this.canvasCtx.clearRect(fillX, fillY, this.size, this.size);
  }

  drawFill(color: string) {
    const fillX = this.x + 0.5 * this.borderWeight;
    const fillY = this.y + 0.5 * this.borderWeight;

    this.canvasCtx.fillStyle = color;
    this.canvasCtx.fillRect(fillX, fillY, this.size, this.size);
  }

  drawWalls(walls: Walls) {
    const { canvasCtx } = this;

    // Skip drawing walls if this is an internally blocked cell.
    if (this.blockedInternal) {
      return;
    }

    canvasCtx.strokeStyle = this.borderColor;
    canvasCtx.lineWidth = this.borderWeight;

    if (this.walls[DirectionIndex.NORTH]) {
      this.line(this.x, this.y, this.x + this.size, this.y, this.borderColor);
    }

    if (this.walls[DirectionIndex.EAST]) {
      if (!this.isEnd) {
        this.line(
          this.x + this.size,
          this.y,
          this.x + this.size,
          this.y + this.size,
          this.borderColor
        );
      }
    }

    if (this.walls[DirectionIndex.SOUTH]) {
      this.line(
        this.x,
        this.y + this.size,
        this.x + this.size,
        this.y + this.size,
        this.borderColor
      );
    }

    if (this.walls[DirectionIndex.WEST]) {
      if (!this.isStart) {
        this.line(this.x, this.y, this.x, this.y + this.size, this.borderColor);
      }
    }
  }

  line(x1: number, y1: number, x2: number, y2: number, color: string = '#000') {
    const { canvasCtx } = this;

    canvasCtx.strokeStyle = color;

    canvasCtx.beginPath();
    canvasCtx.moveTo(x1, y1);
    canvasCtx.lineTo(x2, y2);
    canvasCtx.stroke();
  }
}
