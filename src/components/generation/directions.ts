import { DirectionName } from './Cell/types';

interface Direction {
  name: DirectionName;
  getNeighborIndices: (rowIndex: number, colIndex: number) => [number, number];
}

export const DIRECTIONS: Direction[] = [
  {
    name: 'Top',
    getNeighborIndices: (rowIndex, colIndex) => [rowIndex - 1, colIndex],
  },
  {
    name: 'Right',
    getNeighborIndices: (rowIndex, colIndex) => [rowIndex, colIndex + 1],
  },
  {
    name: 'Bottom',
    getNeighborIndices: (rowIndex, colIndex) => [rowIndex + 1, colIndex],
  },
  {
    name: 'Left',
    getNeighborIndices: (rowIndex, colIndex) => [rowIndex, colIndex - 1],
  },
];
