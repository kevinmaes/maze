const NORTH = 0;
const EAST = 1;
const SOUTH = 2;
const WEST = 3;

export default class Cell {
  constructor({
    ctx,
    index,
    rowIndex,
    colIndex,
    size = 25,
    borderWeight = 2,
    borderColor = 'gray',
    cursorColor = 'yellow',
    visitedColor = 'rgba(0, 0, 0, 0.1)',
    backtrackColor = 'white',
    renderInitial = false,
    isStart = false,
    isMiddle = false,
    isEnd = false,
  }) {
    this.ctx = ctx;
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

    this.connections = [];

    if (renderInitial) {
      this.walls = [true, true, true, true];
    } else {
      this.walls = [false, false, false, false];
    }

    this.visited = false;
  }

  getConnections() {
    return this.connections;
  }

  connect(cell, { mutual } = { mutual: true }) {
    this.connections.push(cell);

    if (cell.rowIndex > this.rowIndex) {
      this.walls[SOUTH] = false;
    }

    if (cell.rowIndex < this.rowIndex) {
      this.walls[NORTH] = false;
    }

    if (cell.colIndex > this.colIndex) {
      this.walls[EAST] = false;
    }

    if (cell.colIndex < this.colIndex) {
      this.walls[WEST] = false;
    }

    if (mutual) {
      cell.connect(this, { mutual: false });
    }

    return this;
  }

  disconnect(cell, { mutual } = { mutual: true }) {
    this.connections = this.connections.filter((c) => c.index === cell.index);

    if (mutual) {
      cell.disconnect(this, { mutual: false });
    }

    return this;
  }

  isVisited() {
    return this.visited;
  }

  visit(prevCell, pathId) {
    this.pathId = pathId;
    this.visited = true;

    // Mark the search cursor as true.
    // This will be set to false at the end of draw().
    this.cursor = true;

    if (!this.isStart && !this.isEnd) {
      this.walls = [true, true, true, true];
    }

    if (prevCell) {
      this.connect(prevCell);
    }
    return this;
  }

  hasDifferentPathId(cell) {
    return this.pathId && cell.pathId && this.pathId !== cell.pathId;
  }

  getFillColor() {
    switch (true) {
      case this.blockedExternal:
      case this.blockedInternal:
        return this.borderColor;
      case this.cursor:
        return this.cursorColor;
      case this.backtrack:
        return this.backtrackColor;
      case this.visited:
        return this.visitedColor;
      default:
        return 'white';
    }
  }

  draw() {
    this.drawFill(this.getFillColor());
    this.drawWalls(this.walls);

    // Set cursor to false so it only shows on a single render.
    this.cursor = false;
  }

  drawFill(color) {
    const fillX = this.x + 0.5 * this.borderWeight;
    const fillY = this.y + 0.5 * this.borderWeight;

    this.ctx.fillStyle = color;
    this.ctx.fillRect(fillX, fillY, this.size, this.size);
  }

  drawWalls(walls) {
    const { ctx } = this;

    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = this.borderWeight;

    if (this.walls[NORTH]) {
      this.line(this.x, this.y, this.x + this.size, this.y);
    }

    if (this.walls[EAST]) {
      this.line(
        this.x + this.size,
        this.y,
        this.x + this.size,
        this.y + this.size
      );
    }

    if (this.walls[SOUTH]) {
      this.line(
        this.x,
        this.y + this.size,
        this.x + this.size,
        this.y + this.size
      );
    }

    if (this.walls[WEST]) {
      this.line(this.x, this.y, this.x, this.y + this.size);
    }
  }

  line(x1, y1, x2, y2, color = '#000') {
    const { ctx } = this;

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}
