import { DIRECTIONS } from './directions';
import Cell from './Cell';

export default class Grid {
  constructor({ rows, cols, startIndex = 0, cellSize = 10 }) {
    this.rows = rows;
    this.cols = cols;
    this.cellTotal = rows * cols;
    this.cells = [];

    this.create();
  }

  create() {
    for (let index = 0; index < this.cellTotal; index++) {
      const cell = new Cell({
        index,
        colIndex: index % this.cols,
        rowIndex: Math.floor(index / this.cols),
      });

      this.cells.push(cell);
    }
  }

  getCells() {
    return this.cells;
  }

  getStartCell() {
    const startCell = this.getCellByIndex();
    startCell.visited = true;
    return startCell;
  }

  getCellByIndex(index = 0) {
    return this.cells[index];
  }

  getNeighbors(cell) {
    const neighbors = DIRECTIONS.map((direction) => {
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
      .filter((index) => index !== null)
      .map((index) => this.cells[index]);
    return neighbors;
  }

  getUnvisitedNeighbors(cell) {
    return this.getNeighbors(cell).filter((neighbor) => {
      return !neighbor.isVisited();
    });
  }

  pickNeighbor(cell) {
    const neighbors = this.getUnvisitedNeighbors(cell);
    const nextIndex = Math.floor(Math.random() * neighbors.length);
    return neighbors[nextIndex];
  }
}
