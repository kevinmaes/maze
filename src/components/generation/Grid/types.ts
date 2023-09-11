import { ICell } from '../Cell';

export interface IGrid {
  getCanvasCtx: () => CanvasRenderingContext2D;
  getCells: () => ICell[];
  getColumns: () => number;
  getRows: () => number;
  getNeighbors: (cell: ICell) => ICell[];
  getStartCell: () => ICell;
  pickNeighbor: (cell: ICell) => ICell;
}
