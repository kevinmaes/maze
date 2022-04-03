export interface TCell {
  // canvasCtx: any;
  // index: number;
  // rowIndex: number;
  // colIndex: number;
  // size: number;
  // borderWeight: number;
  // borderColor?: string;
  // cursorColor?: string;
  // visitedColor: string;
  // backtrackColor: string;
  // isStart: boolean;
  // isMiddle: boolean;
  // isEnd: boolean;
  // isBlocked: boolean;
}

interface CellMethods {
  connect: (cell: ICell, opts: { mutual: boolean }) => void;
  disconnect: (cell: ICell, opts: { mutual: boolean }) => void;
  draw: () => void;
  getColumnIndex: () => number;
  getIndex: () => number;
  getPathId: () => string;
  getRowIndex: () => number;
  isIneligible: () => boolean;
  setAsBacktrack: () => void;
  setAsCursor: () => void;
  setAsVisited: () => void;
  unsetAsCursor: () => void;
  visit: (prevCell: ICell, pathId: string) => void;
}

export type ICell = TCell & CellMethods;

export type Connections = ICell[];
export type Walls = [boolean, boolean, boolean, boolean];

export enum DirectionIndex {
  NORTH = 0,
  EAST,
  SOUTH,
  WEST,
}
