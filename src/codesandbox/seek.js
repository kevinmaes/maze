import { getNextCell } from './helpers';

export const seek = ({
  grid,
  pathId,
  current,
  stack,
  startIndex = 0,
  endIndex = null,
}) => {
  let next;
  if (current) {
    next = getNextCell({
      pathId,
      grid,
      currentCell: current,
      stack,
    });
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

  // if (next) {
  //   stack.push(next);
  //   return next;
  // }
};
