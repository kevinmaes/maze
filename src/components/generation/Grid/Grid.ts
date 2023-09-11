import Cell from '../Cell';
import { IGrid } from './types';
import { ICell } from '../Cell';
import { DirectionName } from '../Cell/types';
import { getColumnIndex, getIndex, getRowIndex } from './gridHelpers';
import { isEligible } from '../Cell/Cell';

const neighborsAt: Record<
  DirectionName,
  (rowIndex: number, columnIndex: number) => [number, number]
> = {
  Top: (rowIndex, colIndex) => [rowIndex - 1, colIndex],
  Right: (rowIndex, colIndex) => [rowIndex, colIndex + 1],
  Bottom: (rowIndex, colIndex) => [rowIndex + 1, colIndex],
  Left: (rowIndex, colIndex) => [rowIndex, colIndex - 1],
};

export default class Grid implements IGrid {
  public cells: ICell[];

  private cellTotal: number;
  private endIndex: number;

  constructor(
    private canvasCtx: CanvasRenderingContext2D,
    private cols: number,
    private rows: number,
    private startIndex: number = 0,
    private cellSize: number = 10,
    private borderWeight: number = 1,

    // Blocked cells can be used to create visual patterns within the grid.
    private blockedCells: ICell[] = []
  ) {
    this.cellTotal = rows * cols;
    this.endIndex = this.cellTotal - 1;
    this.cells = [];

    if (blockedCells) {
      this.blockedCells = blockedCells;
    }

    this.create();
  }

  getCanvasCtx(): CanvasRenderingContext2D {
    return this.canvasCtx;
  }

  create() {
    // const middleColIndex = Math.floor(gridColumns / 2);
    const middleRowIndex = Math.floor(this.rows / 2);
    const middleIndex = middleRowIndex * this.cols + middleRowIndex;

    for (let index = 0; index < this.cellTotal; index++) {
      const isBlocked = Boolean(
        this.blockedCells.find((cell) => cell.getIndex() === index)
      );

      const cellPosition = {
        index,
        column: getColumnIndex(index, this.cols),
        row: getRowIndex(index, this.cols),
        isBlocked,
        isEnd: index === this.endIndex,
        isMiddle: index === middleIndex,
        isStart: index === this.startIndex,
      };

      const cellStyle = {
        backtrackColor: 'rgba(255,0,0, 0)',
        borderColor: 'white',
        borderWeight: this.borderWeight,
        cursorColor: 'white',
        size: this.cellSize,
        visitedColor: 'rgba(236, 233, 168, 0.4)',
      };

      const cell = new Cell(this.canvasCtx, cellPosition, cellStyle);

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

  getStartCell(): ICell {
    const startCell = this.getCellByIndex();
    startCell.setAsVisited();
    return startCell;
  }

  getCellByIndex(index = 0) {
    return this.cells[index];
  }

  /**
   * Returns a variable length array of eligible neighboring cells.
   * @param cell
   * @returns
   */
  getNeighbors(cell: ICell) {
    return (
      // Get the neighbor's row/column indices.
      Object.values(neighborsAt)
        .map((getNeighbor) =>
          getNeighbor(cell.getRowIndex(), cell.getColumnIndex())
        )
        // Ensure the neighbor is within the grid.
        .filter(
          ([nRowIndex, nColIndex]) =>
            nColIndex >= 0 &&
            nRowIndex >= 0 &&
            nColIndex < this.cols &&
            nRowIndex < this.rows
        )
        // Get the neighboring cell.
        .map(([nRowIndex, nColIndex]) => {
          const neighborIndex = getIndex(nRowIndex, nColIndex, this.cols);
          return this.cells[neighborIndex];
        })
        .filter(isEligible)
    );
  }

  pickNeighbor(cell: ICell) {
    const neighbors = this.getNeighbors(cell);
    const nextIndex = Math.floor(Math.random() * neighbors.length);
    return neighbors[nextIndex];
  }

  // Draw all cells.
  draw() {
    const cells = this.getCells();
    for (const cell of cells) {
      cell.draw();
    }
  }
}
