const getIsBlockedInternal = cell => {
  if (cell.index === 0) {
    return false;
  }

  return !((cell.index / 4) % 10);
};

const getIsBlockedExternal = cell => {
  if (cell.index === 0) {
    return false;
  }

  const colIndex = cell.index % grid.cols;
  const rowIndex = Math.floor(cell.index / grid.cols);

  if (rowIndex === 0 && !(colIndex % 5)) {
    return true;
  }

  if (rowIndex === grid.rows - 1 && !(colIndex % 5)) {
    return true;
  }

  if (colIndex === 0) {
    if (
      rowIndex === grid.rows / 2 ||
      rowIndex === grid.rows / 2 - 1 ||
      rowIndex === grid.rows / 2 + 1
    ) {
      return true;
    }
  }

  if (colIndex === grid.cols - 1) {
    if (
      rowIndex === grid.rows / 2 ||
      rowIndex === grid.rows / 2 - 1 ||
      rowIndex === grid.rows / 2 + 1
    ) {
      return true;
    }
  }

  return false;
};
