import { ICell } from '../Cell';

export interface IGrid {
  getCanvasCtx: () => CanvasRenderingContext2D;
  getColumns: () => number;
  getRows: () => number;
  getStartCell: () => ICell;
  visitStartCell: (pathId: string) => ICell;
  getNeighbors: (cell: ICell) => ICell[];
  pickNeighbor: (cell: ICell) => ICell;
}
