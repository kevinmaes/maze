class Cell {
  constructor({
    index,
    grid,
    size = 25,
    borderWeight = 2,
    borderColor = "gray",
    cursorColor = "yellow",
    visitedColor = "rgba(0, 0, 0, 0.1)",
    backtrackColor = "white",
    renderInitial = false,
    isStart = false,
    isMiddle = false,
    isEnd = false
  }) {
    this.index = index;
    this.grid = grid;
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

    // if (renderInitial || this.isStart || this.isMiddle || this.isEnd) {
    if (renderInitial || this.isStart || this.isEnd) {
      this.walls = [true, true, true, true];
    } else {
      if (
        this.colIndex === 0 ||
        this.colIndex === grid.cols - 1 ||
        this.rowIndex === 0 ||
        this.rowIndex === grid.rows - 1
      ) {
        this.walls = [true, true, true, true];
      } else {
        this.walls = [false, false, false, false];
      }
    }

    // this.walls = [false, false, false, false];
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

  getSolutionNeighbors(grid) {
    return this.getNeighbors(grid).filter(neighbor => {
      if (neighbor.colIndex > this.colIndex) {
        // Right
        if (this.walls[1]) {
          return false;
        }
      }
      if (neighbor.colIndex < this.colIndex) {
        // Left
        if (this.walls[3]) {
          return false;
        }
      }

      if (neighbor.rowIndex > this.rowIndex) {
        // Down
        if (this.walls[2]) {
          return false;
        }
      }
      if (neighbor.rowIndex < this.rowIndex) {
        // Up
        if (this.walls[0]) {
          return false;
        }
      }
      return true;
    });
  }

  markSolution(direction) {
    // Add line in the correct direction
  }

  unmarkSolution() {
    // Remove line
  }

  isVisited() {
    return this.visited;
  }

  markVisited(prevCell, pathId) {
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

    // if (!this.isStart && !this.isMiddle && !this.isEnd) {
    //   this.walls = [true, true, true, true];
    // }

    if (!this.isStart && !this.isEnd) {
      this.walls = [true, true, true, true];
    }

    if (prevCell) {
      if (this.rowIndex > prevCell.rowIndex) {
        this.walls[0] = false;
        prevCell.walls[2] = false;
      }

      if (this.rowIndex < prevCell.rowIndex) {
        this.walls[2] = false;
        prevCell.walls[0] = false;
      }

      if (this.colIndex > prevCell.colIndex) {
        this.walls[3] = false;
        prevCell.walls[1] = false;
      }

      if (this.colIndex < prevCell.colIndex) {
        this.walls[1] = false;
        prevCell.walls[3] = false;
      }
    }

    // Open the start and end cells to enter/exit the maze.
    if (this.isStart) {
      this.walls[3] = false;
    } else if (this.isEnd) {
      this.walls[1] = false;
    }

    return this;
  }

  hasDifferentPathId(cell) {
    return this.pathId && cell.pathId && this.pathId !== cell.pathId;
  }

  connectToNeighbor(neighborCell) {
    if (this.rowIndex > neighborCell.rowIndex) {
      this.walls[0] = false;
      neighborCell.walls[2] = false;
    }

    if (this.rowIndex < neighborCell.rowIndex) {
      this.walls[2] = false;
      neighborCell.walls[0] = false;
    }

    if (this.colIndex > neighborCell.colIndex) {
      this.walls[3] = false;
      neighborCell.walls[1] = false;
    }

    if (this.colIndex < neighborCell.colIndex) {
      this.walls[1] = false;
      neighborCell.walls[3] = false;
    }

    // this.backgroundColor = 'red';
    // neighborCell.backgroundColor = 'red';
    // this.draw();
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
        return "white";
    }
  }

  draw() {
    const fillColor = this.getFillColor();
    fill(fillColor);
    noStroke();

    const fillX = this.x + 0.5 * this.borderWeight;
    const fillY = this.y + 0.5 * this.borderWeight;
    square(fillX, fillY, this.size);

    stroke(this.borderColor);
    strokeWeight(this.borderWeight);

    if (this.walls[0]) {
      line(this.x, this.y, this.x + this.size, this.y);
    }

    if (this.walls[1]) {
      line(this.x + this.size, this.y, this.x + this.size, this.y + this.size);
    }

    if (this.walls[2]) {
      line(this.x, this.y + this.size, this.x + this.size, this.y + this.size);
    }

    if (this.walls[3]) {
      line(this.x, this.y, this.x, this.y + this.size);
    }

    // Set cursor to false so it only shows on a single render.
    this.cursor = false;
  }
}
