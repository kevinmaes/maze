import { DirectionName } from './Cell/types';

interface Direction {
  name: DirectionName;
  getIndices: (rowIndex: number, colIndex: number) => [number, number];
}

export const DIRECTIONS: Direction[] = [
  {
    name: 'North',
    getIndices: (rowIndex, colIndex) => [rowIndex - 1, colIndex],
  },
  {
    name: 'East',
    getIndices: (rowIndex, colIndex) => [rowIndex, colIndex + 1],
  },
  {
    name: 'South',
    getIndices: (rowIndex, colIndex) => [rowIndex + 1, colIndex],
  },
  {
    name: 'West',
    getIndices: (rowIndex, colIndex) => [rowIndex, colIndex - 1],
  },
];
