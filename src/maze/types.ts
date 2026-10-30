export type Direction = 'Top' | 'Right' | 'Bottom' | 'Left';

/** One flag per side of a cell. */
export type DirectionFlags = Readonly<Record<Direction, boolean>>;

/** A maze cell as plain, serializable data. */
export interface Cell {
  readonly index: number;
  readonly row: number;
  readonly column: number;
  /** Walls still standing. Connecting two cells removes the shared wall. */
  readonly walls: DirectionFlags;
  /** Sides on the outer boundary of the maze. */
  readonly edges: DirectionFlags;
  readonly visited: boolean;
  readonly backtracked: boolean;
  /** Time of the visit in ms, used by the renderer to fade visited cells. */
  readonly lastVisitedAt: number | null;
  /** Blocked cells are never visited and can form patterns in the maze. */
  readonly blocked: boolean;
  readonly isStart: boolean;
  readonly isEnd: boolean;
}

/** A rectangular maze; `cells` are stored row-major by index. */
export interface Maze {
  readonly columns: number;
  readonly rows: number;
  readonly cells: readonly Cell[];
  readonly startIndex: number;
  readonly endIndex: number;
}
