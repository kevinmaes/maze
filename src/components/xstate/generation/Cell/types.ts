export interface Cell {
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
  draw?: Function;
  connect?: Function;
}
