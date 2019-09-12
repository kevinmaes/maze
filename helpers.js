const getNextCell = ({ pathId, grid, currentCell, stack }) => {
  let next;

  const neighbors = grid.getUnvisitedNeighbors(currentCell);

  // Pick random direction;
  if (neighbors.length) {
    next = grid.pickNeighbor(currentCell);
    return next.visit(currentCell, pathId);
  } else {
    // Dead end, must backtrack.
    const prevCell = stack.pop();

    if (prevCell) {
      prevCell.backtrack = true;
      next = getNextCell({
        grid,
        currentCell: prevCell,
        stack,
      });

      if (next === null) {
        return next;
      }

      return next.visit(prevCell, pathId);
    } else {
      // Search is complete.
      return null;
    }
  }
};
