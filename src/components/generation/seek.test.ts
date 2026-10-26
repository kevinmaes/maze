import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGrid } from '../../test/fixtures';
import type Cell from './Cell';
import { seek } from './seek';

afterEach(() => vi.restoreAllMocks());

describe('seek', () => {
  it('visits the start cell when no current cell exists', () => {
    const grid = createGrid();

    const next = seek({ grid, current: null, pathId: 'path' });

    expect(next).toBe(grid.getStartCell());
    expect(next?.isVisited()).toBe(true);
    expect(next?.getPathId()).toBe('path');
  });

  it('visits a neighbor and clears the previous cursor', () => {
    const grid = createGrid();
    const current = grid.visitStartCell('path');
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const next = seek({ grid, current, pathId: 'path' });

    expect(next).toBe(grid.getCellAtIndex(1));
    expect(next?.isVisited()).toBe(true);
    expect(next?.getPathId()).toBe('path');
    expect((next as Cell).getConnections()).toContain(current);
    expect((current as Cell).getFillColor()).toBe('rgba(37, 99, 235, .4)');
  });

  it('returns undefined and clears the cursor at a dead end', () => {
    const grid = createGrid(1, 1);
    const current = grid.visitStartCell('path');

    const next = seek({ grid, current, pathId: 'path' });

    expect(next).toBeUndefined();
    expect((current as Cell).getFillColor()).toBe('rgba(37, 99, 235, .4)');
  });
});
