import { ICell } from './Cell';
import { IGrid } from './Grid';

interface SeekOptions {
  grid: IGrid;
  pathId: string;
  current: ICell | null;
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

    current.unsetAsCursor();

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
