import { DirectionName } from './Cell/types';

interface Direction {
  name: DirectionName;
  getIndices: (rowIndex: number, colIndex: number) => [number, number];
}

export const DIRECTIONS: Direction[] = [
  {
    name: 'Top',
    getIndices: (rowIndex, colIndex) => [rowIndex - 1, colIndex],
  },
  {
    name: 'Right',
    getIndices: (rowIndex, colIndex) => [rowIndex, colIndex + 1],
  },
  {
    name: 'Bottom',
    getIndices: (rowIndex, colIndex) => [rowIndex + 1, colIndex],
  },
  {
    name: 'Left',
    getIndices: (rowIndex, colIndex) => [rowIndex, colIndex - 1],
  },
];
