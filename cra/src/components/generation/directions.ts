import { DirectionIndex } from './Cell/types';

interface Direction {
  directionIndex: DirectionIndex;
  getIndices: (rowIndex: number, colIndex: number) => [number, number];
}

export const DIRECTIONS: Direction[] = [
  {
    directionIndex: DirectionIndex.NORTH,
    getIndices: (rowIndex, colIndex) => [rowIndex - 1, colIndex],
  },
  {
    directionIndex: DirectionIndex.EAST,
    getIndices: (rowIndex, colIndex) => [rowIndex, colIndex + 1],
  },
  {
    directionIndex: DirectionIndex.SOUTH,
    getIndices: (rowIndex, colIndex) => [rowIndex + 1, colIndex],
  },
  {
    directionIndex: DirectionIndex.WEST,
    getIndices: (rowIndex, colIndex) => [rowIndex, colIndex - 1],
  },
];
