// import type { GridMethods as Grid, GridMethods } from './Grid';
// import type { GridMethods } from './Grid';
import type { Cell } from './Cell';

interface SeekOptions {
  // grid: Grid | GridMethods;
  grid: any;
  pathId: string;
  current: Cell | null;
  startIndex: number;
  endIndex?: number | null;
}

export const seek = ({
  grid,
  pathId,
  current,
  startIndex = 0,
  endIndex = null,
}: SeekOptions) => {
  let next;
  if (current) {
    next = grid.pickNeighbor(current);

    // If next cell is found, mark it as visited.
    if (next) {
      return next.visit(current, pathId);
    }
  } else {
    if (endIndex !== null) {
      next = grid.getCells()[endIndex];
      next.isEnd = true;
    } else {
      next = grid.getCells()[startIndex];
      next.isStart = true;
    }

    next.visit(null, pathId);
  }

  return next;
};
