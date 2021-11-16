import { DIRECTIONS } from '../directions';
import type { Cell as TCell, CellMethods } from '../Cell';
import Cell from '../Cell';
import { Grid as TGrid } from './types';

export default class Grid implements TGrid {
  rows: number;
  cols: number;
  cellTotal: number;
  cellSize: number;
  borderWeight: number;
  startIndex: number;
  endIndex: number;
  cells: Cell[];
  canvasCtx: any;

  constructor({
    rows,
    cols,
    borderWeight = 1,
    startIndex = 0,
    cellSize = 10,
    canvasCtx,
  }: TGrid) {
    this.rows = rows;
    this.cols = cols;
    this.cellTotal = rows * cols;
    this.cellSize = cellSize;
    this.borderWeight = borderWeight;
    this.startIndex = startIndex;
    this.endIndex = this.cellTotal - 1;
    this.cells = [];
    this.canvasCtx = canvasCtx;

    this.create();
  }

  create() {
    // const middleColIndex = Math.floor(gridColumns / 2);
    const middleRowIndex = Math.floor(this.rows / 2);
    const middleIndex = middleRowIndex * this.cols + middleRowIndex;

    for (let index = 0; index < this.cellTotal; index++) {
      const cell = new Cell({
        canvasCtx: this.canvasCtx,
        index,
        colIndex: index % this.cols,
        rowIndex: Math.floor(index / this.cols),
        size: this.cellSize,
        borderWeight: this.borderWeight,
        visitedColor: 'rgb(208, 222, 247)',
        backtrackColor: '#fff',
        isStart: index === this.startIndex,
        isMiddle: index === middleIndex,
        isEnd: index === this.endIndex,
        renderInitial: true,
      });

      this.cells.push(cell);
    }
  }

  getCells() {
    return this.cells;
  }

  getRows() {
    return this.rows;
  }

  getColumns() {
    return this.cols;
  }

  getStartCell(): TCell {
    const startCell = this.getCellByIndex();
    startCell.setAsVisited();
    return startCell;
  }

  getCellByIndex(index = 0) {
    return this.cells[index];
  }

  getNeighbors(cell: TCell) {
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
      .filter((index: number | null): index is number => index !== null)
      .map((index) => this.cells[index]);

    return neighbors;
  }

  getUnvisitedNeighbors(cell: TCell) {
    return this.getNeighbors(cell).filter((neighbor: CellMethods) => {
      return !neighbor.isVisited();
    });
  }

  pickNeighbor(cell: TCell) {
    const neighbors = this.getUnvisitedNeighbors(cell);
    const nextIndex = Math.floor(Math.random() * neighbors.length);
    return neighbors[nextIndex];
  }
}
