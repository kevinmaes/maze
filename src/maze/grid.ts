import type { Cell, Direction, DirectionFlags, Maze } from './types';

/*
 * Cells flow left to right and wrap, so knowing the number of columns maps an
 * index to its row and column and back.
 *
 * @example
 * 0, 1, 2
 * 3, 4, 5
 * 6, 7, 8
 */

export function getRowIndex(index: number, columns: number): number {
  return Math.floor(index / columns);
}

export function getColumnIndex(index: number, columns: number): number {
  return index % columns;
}

export function getIndex(row: number, column: number, columns: number): number {
  return row * columns + column;
}

const ALL_WALLS: DirectionFlags = {
  Top: true,
  Right: true,
  Bottom: true,
  Left: true,
};

// Ordered Top, Right, Bottom, Left so a given random value always picks the same neighbor.
const offsets: Record<Direction, readonly [row: number, column: number]> = {
  Top: [-1, 0],
  Right: [0, 1],
  Bottom: [1, 0],
  Left: [0, -1],
};

const opposite: Record<Direction, Direction> = {
  Top: 'Bottom',
  Right: 'Left',
  Bottom: 'Top',
  Left: 'Right',
};

interface CreateMazeOptions {
  columns: number;
  rows: number;
  startIndex?: number;
  /** Indices of cells that are never visited (#331). */
  blockedIndices?: ReadonlySet<number>;
}

export function createMaze({
  columns,
  rows,
  startIndex = 0,
  blockedIndices = new Set(),
}: CreateMazeOptions): Maze {
  const total = columns * rows;
  const endIndex = total - 1;
  if (startIndex < 0 || startIndex >= total) {
    throw new Error(outOfRange(startIndex, endIndex));
  }
  if (blockedIndices.has(startIndex)) {
    throw new Error(`Start index ${startIndex} cannot be blocked.`);
  }

  const cells = Array.from({ length: total }, (_, index): Cell => {
    const row = getRowIndex(index, columns);
    const column = getColumnIndex(index, columns);
    return {
      index,
      row,
      column,
      walls: ALL_WALLS,
      edges: {
        Top: row === 0,
        Right: column === columns - 1,
        Bottom: row === rows - 1,
        Left: column === 0,
      },
      visited: false,
      backtracked: false,
      lastVisitedAt: null,
      blocked: blockedIndices.has(index),
      isStart: index === startIndex,
      isEnd: index === endIndex,
    };
  });

  return { columns, rows, cells, startIndex, endIndex };
}

function outOfRange(index: number, endIndex: number) {
  return `Index ${index} is out of range. Must be between 0 and ${endIndex}.`;
}

export function getCell(maze: Maze, index: number): Cell {
  const cell = maze.cells[index];
  if (index < 0 || index >= maze.cells.length || !cell) {
    throw new Error(outOfRange(index, maze.endIndex));
  }
  return cell;
}

function neighborsWithDirection(maze: Maze, index: number) {
  const { row, column } = getCell(maze, index);
  return (Object.entries(offsets) as [Direction, readonly [number, number]][])
    .map(([direction, [rowOffset, columnOffset]]) => ({
      direction,
      row: row + rowOffset,
      column: column + columnOffset,
    }))
    .filter(
      (neighbor) =>
        neighbor.row >= 0 &&
        neighbor.row < maze.rows &&
        neighbor.column >= 0 &&
        neighbor.column < maze.columns
    )
    .map(({ direction, row, column }) => ({
      direction,
      cell: getCell(maze, getIndex(row, column, maze.columns)),
    }));
}

/** In-bounds neighbors in Top, Right, Bottom, Left order. */
export function getNeighbors(maze: Maze, index: number): Cell[] {
  return neighborsWithDirection(maze, index).map(({ cell }) => cell);
}

/** Neighbors the algorithm may move to next: not yet visited and not blocked. */
export function getEligibleNeighbors(maze: Maze, index: number): Cell[] {
  return getNeighbors(maze, index).filter(
    (cell) => !cell.visited && !cell.blocked
  );
}

/** Returns a new maze with only the given cells replaced. */
function replaceCells(maze: Maze, changed: readonly Cell[]): Maze {
  const cells = [...maze.cells];
  for (const cell of changed) {
    cells[cell.index] = cell;
  }
  return { ...maze, cells };
}

type CellUpdate = Partial<
  Pick<Cell, 'visited' | 'backtracked' | 'lastVisitedAt'>
>;

export function updateCell(
  maze: Maze,
  index: number,
  update: CellUpdate
): Maze {
  return replaceCells(maze, [{ ...getCell(maze, index), ...update }]);
}

/** Removes the shared wall between two adjacent cells, on both sides. */
export function connect(maze: Maze, a: number, b: number): Maze {
  const link = neighborsWithDirection(maze, a).find(
    ({ cell }) => cell.index === b
  );
  if (!link) {
    throw new Error(`Cells ${a} and ${b} are not adjacent.`);
  }
  const from = getCell(maze, a);
  const to = link.cell;
  return replaceCells(maze, [
    { ...from, walls: { ...from.walls, [link.direction]: false } },
    { ...to, walls: { ...to.walls, [opposite[link.direction]]: false } },
  ]);
}
