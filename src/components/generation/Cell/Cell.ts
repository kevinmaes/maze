import {
  ICell,
  Connections,
  Walls,
  DirectionName,
  CellPosition,
  CellStyle,
} from './types';

export default class Cell implements ICell {
  private connections: Connections;
  private walls: Walls;
  private visited: boolean;
  private backtrack: boolean;
  private isCursor = false;

  private pathId: string;

  private x: number;
  private y: number;

  private blockedExternal: boolean;
  private blockedInternal: boolean;

  constructor(
    private canvasCtx: CanvasRenderingContext2D,
    private position: CellPosition,
    private cellStyle: CellStyle
  ) {
    this.pathId = '';
    this.blockedExternal = false;
    this.blockedInternal = this.position.isBlocked;
    this.pathId = '';
    this.x =
      this.position.column * this.cellStyle.size + this.cellStyle.borderWeight;
    this.y =
      this.position.row * this.cellStyle.size + this.cellStyle.borderWeight;

    this.connections = [];
    this.walls = new Set(['Top', 'Right', 'Bottom', 'Left'] as DirectionName[]);
    this.visited = false;
    this.backtrack = false;
  }

  getIndex() {
    return this.position.index;
  }

  getPathId() {
    return this.pathId;
  }

  getConnections() {
    return this.connections;
  }

  getRowIndex() {
    return this.position.row;
  }

  getColumnIndex() {
    return this.position.column;
  }

  connect(cell: ICell, { mutual } = { mutual: true }) {
    this.connections.push(cell);

    if (cell.getRowIndex() > this.position.row) {
      this.walls.delete('Bottom');
    }

    if (cell.getRowIndex() < this.position.row) {
      this.walls.delete('Top');
    }

    if (cell.getColumnIndex() > this.position.column) {
      this.walls.delete('Right');
    }

    if (cell.getColumnIndex() < this.position.column) {
      this.walls.delete('Left');
    }

    if (mutual) {
      cell.connect(this, { mutual: false });
    }

    return this;
  }

  disconnect(cell: ICell, { mutual } = { mutual: true }) {
    this.connections = this.connections.filter(
      (c) => c.getIndex() === cell.getIndex()
    );

    if (mutual) {
      cell.disconnect(this, { mutual: false });
    }

    return this;
  }

  isVisited() {
    return this.visited;
  }

  isBlocked() {
    return this.blockedInternal;
  }

  setAsBacktrack() {
    this.backtrack = true;
  }

  setAsVisited() {
    this.visited = true;
  }

  visit(prevCell: ICell | null, pathId: string): ICell {
    this.pathId = pathId;
    this.visited = true;

    this.setAsCursor();

    if (!this.position.isStart && !this.position.isEnd) {
      this.walls = new Set([
        'Top',
        'Right',
        'Bottom',
        'Left',
      ] as DirectionName[]);
    }

    if (prevCell) {
      this.connect(prevCell);
    }
    return this;
  }

  setAsCursor() {
    this.isCursor = true;
  }

  unsetAsCursor() {
    this.isCursor = false;
  }

  hasDifferentPathId(cell: ICell) {
    return this.pathId && cell.getPathId() && this.pathId !== cell.getPathId();
  }

  getFillColor() {
    const {
      cellStyle: { borderColor, backtrackColor, cursorColor, visitedColor },
    } = this;

    switch (true) {
      case this.blockedExternal:
      case this.blockedInternal:
        return borderColor;
      case this.isCursor:
        return cursorColor;
      case this.backtrack:
        return backtrackColor;
      case this.visited:
        return visitedColor;
      default:
        return 'rgba(0,0,0,0)';
    }
  }

  draw() {
    this.clearFill();
    this.drawFill(this.getFillColor());
    this.drawWalls();
  }

  clearFill() {
    const {
      cellStyle: { borderWeight, size },
    } = this;

    const fillX = this.x + 0.5 * borderWeight;
    const fillY = this.y + 0.5 * borderWeight;

    this.canvasCtx.clearRect(fillX, fillY, size, size);
  }

  drawFill(color: string) {
    const {
      cellStyle: { borderWeight, size },
    } = this;

    const fillX = this.x + 0.5 * borderWeight;
    const fillY = this.y + 0.5 * borderWeight;

    this.canvasCtx.fillStyle = color;
    this.canvasCtx.fillRect(fillX, fillY, size, size);
  }

  drawWalls() {
    // Skip drawing walls if this is an internally blocked cell.
    if (this.blockedInternal) {
      return;
    }

    const {
      canvasCtx,
      cellStyle: { borderColor, borderWeight, size },
      position: { isStart, isEnd },
    } = this;

    canvasCtx.strokeStyle = borderColor;
    canvasCtx.lineWidth = borderWeight;

    if (this.walls.has('Top')) {
      this.line(this.x, this.y, this.x + size, this.y, borderColor);
    }

    if (this.walls.has('Right')) {
      if (!isEnd) {
        this.line(
          this.x + size,
          this.y,
          this.x + size,
          this.y + size,
          borderColor
        );
      }
    }

    if (this.walls.has('Bottom')) {
      this.line(
        this.x,
        this.y + size,
        this.x + size,
        this.y + size,
        borderColor
      );
    }

    if (this.walls.has('Left')) {
      if (!isStart) {
        this.line(this.x, this.y, this.x, this.y + size, borderColor);
      }
    }
  }

  line(x1: number, y1: number, x2: number, y2: number, color = '#000') {
    const { canvasCtx } = this;

    canvasCtx.strokeStyle = color;

    canvasCtx.beginPath();
    canvasCtx.moveTo(x1, y1);
    canvasCtx.lineTo(x2, y2);
    canvasCtx.stroke();
  }
}

/**
 * Filter predicate function to determine if a cell is eligible for the next step in the algorithm.
 * @param cell
 * @returns
 */
export function isEligible(cell: ICell) {
  return !cell.isVisited() && !cell.isBlocked();
}
