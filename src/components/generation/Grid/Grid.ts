import Cell, { ICell } from '../Cell';
import { isEligible } from '../Cell/Cell';
import { DirectionName } from '../Cell/types';
import { getColumnIndex, getIndex, getRowIndex } from './gridHelpers';
import { IGrid } from './types';

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

  getCanvasCtx() {
    return this.canvasCtx;
  }

  create() {
    const middleRowIndex = Math.floor(this.rows / 2);
    const middleIndex = middleRowIndex * this.cols + middleRowIndex;

    for (let index = 0; index < this.cellTotal; index++) {
      const isBlocked = Boolean(
        this.blockedCells.find((cell) => cell.getIndex() === index)
      );

      const edges = new Set<DirectionName>();
      const rowIndex = getRowIndex(index, this.cols);
      const columnIndex = getColumnIndex(index, this.cols);
      if (rowIndex === 0) edges.add('Top');
      if (columnIndex === this.cols - 1) edges.add('Right');
      if (rowIndex === this.rows - 1) edges.add('Bottom');
      if (columnIndex === 0) edges.add('Left');

      const cellPosition = {
        index,
        column: getColumnIndex(index, this.cols),
        row: getRowIndex(index, this.cols),
        isBlocked,
        isEnd: index === this.endIndex,
        isMiddle: index === middleIndex,
        isStart: index === this.startIndex,
        edges,
      };

      const cellStyle = {
        backtrackColor: 'rgba(255,0,0, 0)',
        borderColor: 'white',
        edgeColor: 'white',
        borderWeight: this.borderWeight,
        cursorColor: 'rgba(236, 233, 168, 1)',
        size: this.cellSize,
        visitedColor: 'rgba(37, 99, 235, .4)',
      };

      const cell = new Cell(this.canvasCtx, cellPosition, cellStyle);

      this.cells.push(cell);
    }
  }

  getRows() {
    return this.rows;
  }

  getColumns() {
    return this.cols;
  }

  getCellAtIndex(index: number) {
    if (index < 0 || index > this.cellTotal) {
      throw new Error(
        `Index ${index} is out of range. Must be between 0 and ${this.cellTotal}.`
      );
    }
    return this.cells[index];
  }

  getStartCell() {
    return this.getCellAtIndex(this.startIndex);
  }

  visitStartCell(pathId: string) {
    const startCell = this.getStartCell();
    startCell.visit(null, pathId);
    return startCell;
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
          ([rowIndex, columnIndex]) =>
            columnIndex >= 0 &&
            rowIndex >= 0 &&
            columnIndex < this.cols &&
            rowIndex < this.rows
        )
        // Get the neighboring cell from indices.
        .map(([rowIndex, columnIndex]) => {
          const neighborIndex = getIndex(rowIndex, columnIndex, this.cols);
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
    for (const cell of this.cells) {
      cell.draw();
    }
  }
}
