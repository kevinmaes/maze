const pickNeighbor = neighbors => {
  const nextIndex = Math.floor(Math.random() * neighbors.length);
  return neighbors[nextIndex];
};

const getNextCell = ({ pathId, grid, currentCell, stack }) => {
  let next;

  const neighbors = currentCell.getUnvisitedNeighbors(grid);

  // Pick random direction;
  if (neighbors.length) {
    next = pickNeighbor(neighbors);
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
