function seek({ pathId, current, stack, startIndex = 0, endIndex = null }) {
  // Get the currentSquare for A
  if (current) {
    next = getNextCell({
      pathId,
      grid,
      currentCell: current,
      stack
    });
  } else {
    if (endIndex !== null) {
      next = grid.cells[endIndex];
      next.isEnd = true;
    } else {
      next = grid.cells[startIndex];
      next.isStart = true;
    }

    next.markVisited(null, pathId);
  }

  if (next) {
    stack.push(next);
    return next;
  }
}

function seekSolution({
  pathId,
  current,
  stack,
  startIndex = 0,
  endIndex = null
}) {
  console.log("seekSolution", seekSolution);
  // Get the currentSquare for A
  if (current) {
    next = getNextSolutionCell({
      pathId,
      grid,
      currentCell: current,
      stack
    });
  } else {
    next = grid.cells[startIndex];
    next.isStart = true;

    next.markSolution();
  }

  if (next) {
    stack.push(next);
    return next;
  }
}
