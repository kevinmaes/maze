import type { ICell, Cell } from '../Cell';

export interface Grid {
  rows: number;
  cols: number;
  borderWeight?: number;
  startIndex?: number;
  cellSize?: number;
  canvasCtx?: any;
  cells?: Cell[];
  blockedCells?: number[];
}

export interface GridMethods {
  getCells: Function;
  getRows: Function;
  getColumns: Function;
  getNeighbors: Function;
  pickNeighbor: Function;
  getStartCell: Function;
  getEligibleNeighbors: Function;
}
