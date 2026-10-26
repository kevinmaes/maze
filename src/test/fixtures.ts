import Cell from '../components/generation/Cell';
import type { CellPosition } from '../components/generation/Cell/types';
import Grid from '../components/generation/Grid';

export function canvasContext() {
  const context = document.createElement('canvas').getContext('2d');
  if (!context) throw new Error('Canvas context is unavailable');
  return context;
}

export function createGrid(columns = 3, rows = 3, startIndex = 0) {
  return new Grid(canvasContext(), columns, rows, startIndex);
}

export const cellStyle = {
  backtrackColor: 'backtrack',
  borderColor: 'border',
  edgeColor: 'edge',
  borderWeight: 1,
  size: 20,
  cursorColor: 'cursor',
  visitedColor: 'visited',
};

export function createCell(position: Partial<CellPosition> = {}) {
  return new Cell(
    canvasContext(),
    {
      column: 1,
      row: 1,
      index: 4,
      isBlocked: false,
      isEnd: false,
      isStart: false,
      edges: new Set(),
      ...position,
    },
    cellStyle
  );
}
