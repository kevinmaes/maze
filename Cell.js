const NORTH = 0;
const EAST = 1;
const SOUTH = 2;
const WEST = 3;

class Cell {
  constructor({
    index,
    grid,
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
    this.colIndex = index % grid.cols;
    this.rowIndex = Math.floor(index / grid.cols);
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

  getNeighbors(grid) {
    const neighbors = DIRECTIONS.map(direction => {
      const [nRowIndex, nColIndex] = direction.getIndices(
        this.rowIndex,
        this.colIndex
      );
      // Ensure it is on the grid.
      if (
        nRowIndex < 0 ||
        nColIndex < 0 ||
        nRowIndex > grid.rows - 1 ||
        nColIndex > grid.cols - 1
      ) {
        return null;
      }
      const index = nRowIndex * grid.cols + nColIndex;
      return index;
    })
      .filter(index => index !== null)
      .map(index => grid.cells[index]);
    return neighbors;
  }

  getUnvisitedNeighbors(grid) {
    return this.getNeighbors(grid).filter(neighbor => {
      return !neighbor.isVisited();
    });
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
    this.connections = this.connections.filter(c => c.index === cell.index);

    if (mutual) {
      cell.disconnect(this, { mutual: false });
    }

    return this;
  }

  isVisited() {
    return this.visited;
  }

  visit(prevCell, pathId) {
    // console.log('pathId', pathId);
    this.pathId = pathId;
    this.visited = true;

    // Mark the search cursor with a different color.
    // This will be set to false at the end of draw().
    this.cursor = true;

    const fillColor = this.getFillColor();
    fill(fillColor);
    noStroke();
    const cursorX = this.x + 0.5 * this.borderWeight;
    const cursorY = this.y + 0.5 * this.borderWeight;
    square(cursorX, cursorY, this.size - this.borderWeight);

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
    const fillColor = this.getFillColor();
    fill(fillColor);
    noStroke();

    const fillX = this.x + 0.5 * this.borderWeight;
    const fillY = this.y + 0.5 * this.borderWeight;
    square(fillX, fillY, this.size);

    this.drawWalls(this.walls);

    // Set cursor to false so it only shows on a single render.
    this.cursor = false;
  }

  drawWalls(walls) {
    stroke(this.borderColor);
    strokeWeight(this.borderWeight);

    if (this.walls[NORTH]) {
      line(this.x, this.y, this.x + this.size, this.y);
    }

    if (this.walls[EAST]) {
      line(this.x + this.size, this.y, this.x + this.size, this.y + this.size);
    }

    if (this.walls[SOUTH]) {
      line(this.x, this.y + this.size, this.x + this.size, this.y + this.size);
    }

    if (this.walls[WEST]) {
      line(this.x, this.y, this.x, this.y + this.size);
    }
  }
}
