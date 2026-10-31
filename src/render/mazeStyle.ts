export interface MazePalette {
  backtrackColor: string;
  borderColor: string;
  cursorColor: string;
  edgeColor: string;
  unvisitedColor: string;
  /** `r, g, b` channels of the visited fill. */
  visitedRgb: string;
  /** Starting alpha of the visited fill; it fades toward 0 over time. */
  visitedAlpha: number;
}

export interface MazeStyle extends MazePalette {
  borderWeight: number;
  cellSize: number;
}

export const mazePalette: MazePalette = {
  backtrackColor: 'rgba(255,0,0, 0)',
  borderColor: 'white',
  cursorColor: 'rgba(236, 233, 168, 1)',
  edgeColor: 'white',
  unvisitedColor: 'rgba(0,0,0,0)',
  visitedRgb: '37, 99, 235',
  visitedAlpha: 0.4,
};

// Alpha lost per ms since a visit. The higher the value, the faster the fade.
export const FADE_PER_MS = 0.00005;

// The cursor is a smaller square inset within the cell's fill.
export const CURSOR_INSET = 4;
export const CURSOR_SHRINK = 10;
