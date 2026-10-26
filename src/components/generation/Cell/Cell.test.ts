import { describe, expect, it, vi } from 'vitest';
import { cellStyle, createCell } from '../../../test/fixtures';

// Observe wall segments through the public drawing API; never read private walls.
function wallSegments(cell: ReturnType<typeof createCell>) {
  const line = vi.spyOn(cell, 'line');
  cell.drawWalls();
  const segments = line.mock.calls.map(([x1, y1, x2, y2]) => [x1, y1, x2, y2]);
  line.mockRestore();
  return segments;
}

describe('Cell', () => {
  it('visits a cell, records its path, and connects it to the previous cell', () => {
    const previous = createCell({ column: 0, index: 3 });
    const cell = createCell();

    const visited = cell.visit(previous, 'path');

    expect(visited).toBe(cell);
    expect(cell.isVisited()).toBe(true);
    expect(cell.getPathId()).toBe('path');
    expect(cell.getConnections()).toEqual([previous]);
    expect(previous.getConnections()).toEqual([cell]);
    expect(cell.getFillColor()).toBe(cellStyle.cursorColor);
  });

  it.each([
    ['Top', 0, 1, [21, 21, 41, 21], [21, 21, 41, 21]],
    ['Right', 1, 2, [41, 21, 41, 41], [41, 21, 41, 41]],
    ['Bottom', 2, 1, [21, 41, 41, 41], [21, 41, 41, 41]],
    ['Left', 1, 0, [21, 21, 21, 41], [21, 21, 21, 41]],
  ] as const)(
    'opens the %s wall and its reciprocal wall',
    (_, row, column, wall, reciprocal) => {
      const cell = createCell();
      const neighbor = createCell({ row, column, index: row * 3 + column });
      expect(wallSegments(cell)).toContainEqual([...wall]);
      expect(wallSegments(neighbor)).toContainEqual([...reciprocal]);

      cell.connect(neighbor);

      expect(wallSegments(cell)).not.toContainEqual([...wall]);
      expect(wallSegments(neighbor)).not.toContainEqual([...reciprocal]);
      expect(wallSegments(cell)).toHaveLength(3);
      expect(wallSegments(neighbor)).toHaveLength(3);
    }
  );

  it('supports a one-way connection', () => {
    const cell = createCell();
    const neighbor = createCell({ column: 2, index: 5 });

    cell.connect(neighbor, { mutual: false });

    expect(cell.getConnections()).toEqual([neighbor]);
    expect(neighbor.getConnections()).toEqual([]);
    expect(wallSegments(neighbor)).toHaveLength(4);
  });

  it('shows cursor, visited, and backtrack flags through the fill color', () => {
    const cell = createCell();
    expect(cell.getFillColor()).toBe('rgba(0,0,0,0)');

    cell.visit(null, 'path');
    cell.unsetAsCursor();
    expect(cell.getFillColor()).toBe(cellStyle.visitedColor);
    cell.setAsBacktrack();
    expect(cell.getFillColor()).toBe(cellStyle.backtrackColor);
    cell.setAsCursor();
    expect(cell.getFillColor()).toBe(cellStyle.cursorColor);
    expect(() => cell.draw()).not.toThrow();
    cell.unsetAsCursor();
    expect(cell.getFillColor()).toBe(cellStyle.backtrackColor);
  });

  it('keeps blocked cells ineligible and draws them without throwing', () => {
    const cell = createCell({ isBlocked: true });

    cell.setAsCursor();

    expect(cell.isBlocked()).toBe(true);
    expect(cell.getFillColor()).toBe(cellStyle.borderColor);
    expect(wallSegments(cell)).toEqual([]);
    expect(() => cell.draw()).not.toThrow();
  });

  it('compares assigned path IDs', () => {
    const cell = createCell();
    const neighbor = createCell();
    cell.visit(null, 'first');
    neighbor.visit(null, 'second');

    const different = cell.hasDifferentPathId(neighbor);

    expect(different).toBe(true);
    neighbor.visit(null, 'first');
    expect(cell.hasDifferentPathId(neighbor)).toBe(false);
  });

  // #1664: disconnect currently retains the requested connection and drops others.
  it.fails('disconnects both cells while preserving unrelated connections', () => {
    const cell = createCell();
    const right = createCell({ column: 2, index: 5 });
    const bottom = createCell({ row: 2, index: 7 });
    cell.connect(right);
    cell.connect(bottom);

    cell.disconnect(right);

    expect(cell.getConnections()).toEqual([bottom]);
    expect(right.getConnections()).toEqual([]);
    expect(bottom.getConnections()).toEqual([cell]);
  });
});
