import { ICell } from '../Cell';

export interface IGrid {
  getCanvasCtx: () => CanvasRenderingContext2D;
  getStartCell: () => ICell;
  getColumns: () => number;
  getRows: () => number;
  getNeighbors: (cell: ICell) => ICell[];
  visitStartCell: () => ICell;
  pickNeighbor: (cell: ICell) => ICell;
}
