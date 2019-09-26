import { DIRECTIONS } from './constants';

export class Grid {
  constructor({ rows, cols }) {
    this.rows = rows;
    this.cols = cols;
    this.cells = [];
  }

  getNeighbors(cell) {
    const neighbors = DIRECTIONS.map(direction => {
      const [nRowIndex, nColIndex] = direction.getIndices(
        cell.rowIndex,
        cell.colIndex
      );
      // Ensure it is on the grid.
      if (
        nRowIndex < 0 ||
        nColIndex < 0 ||
        nRowIndex > this.rows - 1 ||
        nColIndex > this.cols - 1
      ) {
        return null;
      }
      const index = nRowIndex * this.cols + nColIndex;
      return index;
    })
      .filter(index => index !== null)
      .map(index => this.cells[index]);
    return neighbors;
  }

  getUnvisitedNeighbors(cell) {
    return this.getNeighbors(cell).filter(neighbor => {
      return !neighbor.isVisited();
    });
  }

  pickNeighbor(cell) {
    const neighbors = this.getUnvisitedNeighbors(cell);
    const nextIndex = Math.floor(Math.random() * neighbors.length);
    return neighbors[nextIndex];
  }
}
