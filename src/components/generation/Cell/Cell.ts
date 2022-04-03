import { TCell, ICell, Connections, Walls, DirectionIndex } from './types';

export default class Cell implements ICell {
  backtrack: boolean;
  backtrackColor: string;
  blockedExternal: boolean;
  blockedInternal: boolean;
  borderColor: string;
  borderWeight: number;
  canvasCtx: any;
  colIndex: number;
  connections: Connections;
  cursorColor: string;
  index: number;
  isBlocked: boolean;
  isCursor: boolean;
  isEnd: boolean;
  isMiddle: boolean;
  isStart: boolean;
  pathId: string;
  rowIndex: number;
  size: number;
  visited: boolean;
  visitedColor: string;
  walls: Walls;
  x: number;
  y: number;

  constructor({
    backtrackColor = 'white',
    borderColor = 'white',
    borderWeight = 2,
    canvasCtx,
    colIndex,
    cursorColor = 'white',
    index,
    isBlocked = false,
    isEnd = false,
    isMiddle = false,
    isStart = false,
    rowIndex,
    size = 25,
    visitedColor = 'rgba(0, 0, 0, 0.1)',
  }: TCell) {
    this.backtrack = false;
    this.backtrackColor = backtrackColor;
    this.blockedExternal = false;
    this.blockedInternal = false;
    this.borderColor = borderColor;
    this.borderWeight = borderWeight;
    this.canvasCtx = canvasCtx;
    this.colIndex = colIndex;
    this.cursorColor = cursorColor;
    this.index = index;
    this.isBlocked = isBlocked;
    this.isCursor = false;
    this.isEnd = isEnd;
    this.isMiddle = isMiddle;
    this.isStart = isStart;
    this.pathId = '';
    this.rowIndex = rowIndex;
    this.size = size;
    this.visitedColor = visitedColor;
    this.x = this.colIndex * size + borderWeight;
    this.y = this.rowIndex * size + borderWeight;

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
