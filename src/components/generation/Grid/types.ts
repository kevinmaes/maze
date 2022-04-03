import { ICell } from '../Cell';

export interface IGrid {
  getCanvasCtx: () => CanvasRenderingContext2D;
  getCells: () => ICell[];
  getColumns: () => number;
  getEligibleNeighbors: (cell: ICell) => ICell[];
  getRows: () => number;
  getStartCell: () => ICell;
  pickNeighbor: (cell: ICell) => ICell;
}
