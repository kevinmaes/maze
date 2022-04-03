export interface CellPosition {
  column: number;
  index: number;
  isBlocked: boolean;
  isEnd: boolean;
  isStart: boolean;
  row: number;
}

export interface CellStyle {
  backtrackColor: string;
  borderColor: string;
  borderWeight: number;
  size: number;
  cursorColor: string;
  visitedColor: string;
}

export interface ICell {
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
  visit: (prevCell: ICell | null, pathId: string) => void;
}

export type Connections = ICell[];
export type Walls = [boolean, boolean, boolean, boolean];

export enum DirectionIndex {
  NORTH = 0,
  EAST,
  SOUTH,
  WEST,
}
