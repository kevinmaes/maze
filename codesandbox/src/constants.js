export const DIRECTIONS = [
  {
    index: 0,
    name: 'up',
    getIndices: (rowIndex, colIndex) => [rowIndex - 1, colIndex],
  },
  {
    index: 1,
    name: 'right',
    getIndices: (rowIndex, colIndex) => [rowIndex, colIndex + 1],
  },
  {
    index: 2,
    name: 'down',
    getIndices: (rowIndex, colIndex) => [rowIndex + 1, colIndex],
  },
  {
    index: 3,
    name: 'left',
    getIndices: (rowIndex, colIndex) => [rowIndex, colIndex - 1],
  },
];
