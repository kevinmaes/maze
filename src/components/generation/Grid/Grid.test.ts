import { afterEach, describe, expect, it, vi } from 'vitest';
import { canvasContext, createCell, createGrid } from '../../../test/fixtures';
import Grid from './Grid';

afterEach(() => vi.restoreAllMocks());

describe('Grid', () => {
  it('creates all cells in a rectangular grid with the requested start cell', () => {
    const grid = createGrid(4, 2, 5);

    const start = grid.visitStartCell('path');

    expect(grid.cells).toHaveLength(8);
    expect(grid.getColumns()).toBe(4);
    expect(grid.getRows()).toBe(2);
    expect(start).toBe(grid.getCellAtIndex(5));
    expect(start.isVisited()).toBe(true);
    expect(start.getPathId()).toBe('path');
    expect(grid.getCellAtIndex(7).getRowIndex()).toBe(1);
    expect(() => grid.draw()).not.toThrow();
  });

  it.each([
    [0, [1, 3]],
    [2, [5, 1]],
    [6, [3, 7]],
    [8, [5, 7]],
    [1, [2, 4, 0]],
    [4, [1, 5, 7, 3]],
  ])('only returns in-bounds neighbors of cell %i', (index, expected) => {
    const grid = createGrid();

    const neighbors = grid.getNeighbors(grid.getCellAtIndex(index));

    expect(neighbors.map((cell) => cell.getIndex())).toEqual(expected);
  });

  it('excludes visited and blocked neighbors', () => {
    const grid = new Grid(canvasContext(), 3, 3, 0, 10, 1, [
      createCell({ index: 1 }),
    ]);
    grid.getCellAtIndex(5).visit(null, 'path');

    const neighbors = grid.getNeighbors(grid.getCellAtIndex(4));

    expect(neighbors.map((cell) => cell.getIndex())).toEqual([7, 3]);
    expect(grid.getCellAtIndex(1).isBlocked()).toBe(true);
  });

  it.each([
    [0, 1],
    [0.3, 5],
    [0.99, 3],
  ])('picks a neighbor with random value %f', (random, index) => {
    const grid = createGrid();
    vi.spyOn(Math, 'random').mockReturnValue(random);

    const next = grid.pickNeighbor(grid.getCellAtIndex(4));

    expect(next).toBe(grid.getCellAtIndex(index));
  });

  it('returns no neighbor at a dead end', () => {
    const grid = createGrid(1, 1);

    const next = grid.pickNeighbor(grid.getStartCell());

    expect(next).toBeUndefined();
  });

  // #1664: the reported off-by-one check was already fixed in #1681.
  it.each([-1, 9, 10])('rejects out-of-bounds index %i', (index) => {
    const grid = createGrid();

    const lookup = () => grid.getCellAtIndex(index);

    expect(lookup).toThrow(/out of range/);
    expect(grid.getCellAtIndex(8).getIndex()).toBe(8);
  });
});
