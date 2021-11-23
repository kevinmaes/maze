export const DIRECTIONS = [
  {
    index: 0,
    name: 'up',
    getIndices: (rowIndex: number, colIndex: number) => [
      rowIndex - 1,
      colIndex,
    ],
  },
  {
    index: 1,
    name: 'right',
    getIndices: (rowIndex: number, colIndex: number) => [
      rowIndex,
      colIndex + 1,
    ],
  },
  {
    index: 2,
    name: 'down',
    getIndices: (rowIndex: number, colIndex: number) => [
      rowIndex + 1,
      colIndex,
    ],
  },
  {
    index: 3,
    name: 'left',
    getIndices: (rowIndex: number, colIndex: number) => [
      rowIndex,
      colIndex - 1,
    ],
  },
];
