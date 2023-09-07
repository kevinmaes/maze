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
  visit: (prevCell: ICell | null, pathId: string) => ICell;
}

export type DirectionName = 'North' |'East' |'South' |'West';
export type Connections = ICell[];
export type Walls = Set<DirectionName>;

