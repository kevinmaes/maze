export interface TCell {
  canvasCtx: any;
  index: number;
  rowIndex: number;
  colIndex: number;
  size: number;
  borderWeight: number;
  borderColor?: string;
  cursorColor?: string;
  visitedColor: string;
  backtrackColor: string;
  renderInitial: boolean;
  isStart: boolean;
  isMiddle: boolean;
  isEnd: boolean;
  isBlocked: boolean;
}

interface CellMethods {
  draw: Function;
  connect?: Function;
  isIneligible: Function;
  setAsBacktrack: Function;
  setAsVisited: Function;
  getIndex: Function;
  visit: Function;
  unsetAsCursor: Function;
}

export type ICell = TCell & CellMethods;

export type Connections = ICell[];
export type Walls = boolean[];
