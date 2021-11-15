import type { Cell, Cell as TCell } from '../Cell';

export interface Grid {
  rows: number;
  cols: number;
  borderWeight?: number;
  startIndex?: number;
  cellSize?: number;
  canvasCtx?: any;
  cells?: TCell[];
  getNeighbors?: Function;
  getCells?: Function;
}
