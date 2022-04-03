import { ICell } from '../Cell';

export interface IGrid {
  getCanvasCtx: () => CanvasRenderingContext2D;
  getCells: Function;
  getRows: Function;
  getColumns: Function;
  getNeighbors: Function;
  pickNeighbor: Function;
  getStartCell: Function;
  getEligibleNeighbors: Function;
}
