import type { Grid } from './Grid';
import type { Cell } from './Cell';

interface SeekOptions {
  grid: Grid;
  pathId: string;
  current: Cell | null;
  startIndex: number;
  endIndex?: number | null;
  stack: Cell[];
}

export const seek = ({
  grid: any,
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
      next = grid.cells[endIndex];
      next.isEnd = true;
    } else {
      next = grid.cells[startIndex];
      next.isStart = true;
    }

    next.visit(null, pathId);
  }

  return next;
};
