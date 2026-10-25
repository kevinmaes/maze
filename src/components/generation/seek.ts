import type { ICell } from './Cell';
import type { IGrid } from './Grid';

interface SeekOptions {
  grid: IGrid;
  pathId: string;
  current: ICell | null;
}

export const seek = ({
  grid,
  pathId,
  current,
}: SeekOptions): ICell | undefined => {
  let next;
  if (current) {
    next = grid.pickNeighbor(current);

    current.unsetAsCursor();

    // If next cell is found, mark it as visited.
    if (next) {
      return next.visit(current, pathId);
    }
  } else {
    next = grid.getStartCell();
    next.visit(null, pathId);
  }

  return next;
};
