import { DIRECTIONS } from '../directions';
import Cell from '../Cell';
import { IGrid } from './types';
import { ICell } from '../Cell';

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
        column: index % this.cols,
        index,
        isBlocked,
        isEnd: index === this.endIndex,
        isMiddle: index === middleIndex,
        isStart: index === this.startIndex,
        row: Math.floor(index / this.cols),
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

  getNeighbors(cell: ICell) {
    const neighbors = DIRECTIONS.map((direction) => {
      const [nRowIndex, nColIndex] = direction.getIndices(
        cell.getRowIndex(),
        cell.getColumnIndex()
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
      const neighborIndex = nRowIndex * this.cols + nColIndex;
      return neighborIndex;
    })
      .filter(
        (neighborIndex: number | null): neighborIndex is number =>
          neighborIndex !== null
      )
      .map((neighborIndex) => this.cells[neighborIndex]);

    return neighbors;
  }

  getEligibleNeighbors(cell: ICell) {
    return this.getNeighbors(cell).filter((neighbor: ICell) => {
      return !neighbor.isIneligible();
    });
  }

  pickNeighbor(cell: ICell) {
    const neighbors = this.getEligibleNeighbors(cell);
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
