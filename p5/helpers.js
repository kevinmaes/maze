const getNextCell = ({ pathId, grid, currentCell, stack }) => {
  // Pick next unvisited neighbor.
  const next = grid.pickNeighbor(currentCell);

  // If next cell is found, mark it as visited.
  if (next) {
    return next.visit(currentCell, pathId);
  }

  // Dead end, must backtrack.
  const prevCell = stack.pop();

  if (prevCell) {
    prevCell.backtrack = true;

    return getNextCell({
      grid,
      currentCell: prevCell,
      stack,
    });
  } else {
    // Search is complete.
    return null;
  }
};
