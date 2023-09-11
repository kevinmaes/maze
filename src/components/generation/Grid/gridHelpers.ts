// 1. Get a cell's rowIndex from its index.
/*
 * In a grid of cells flowing left -> right, and wrapping
 *
 * @example
 * 0, 1, 2
 * 3, 4, 5
 * 6, 7, 8
 *
 * knowing the total number of columns (3) allows you to call the following functions
 */

/**
 * Get a cell's rowIndex from its index.
 * @param index
 * @param numberOfColumns
 * @returns
 */
export function getRowIndex(index: number, numberOfColumns: number): number {
  return Math.floor(index / numberOfColumns);
}

/**
 * Get a cell's columnIndex from its index.
 * @param index
 * @param numberOfColumns
 * @returns
 */
export function getColumnIndex(index: number, numberOfColumns: number): number {
  return index % numberOfColumns;
}

/**
 * Get a cell's index from its rowIndex and columnIndex.
 * @param rowIndex
 * @param columnIndex
 * @param numberOfColumns
 * @returns
 */
export function getIndex(
  rowIndex: number,
  columnIndex: number,
  numberOfColumns: number
): number {
  return rowIndex * numberOfColumns + columnIndex;
}
