import { describe, expect, it } from 'vitest';
import {
  connect,
  createMaze,
  getCell,
  getColumnIndex,
  getEligibleNeighbors,
  getIndex,
  getNeighbors,
  getRowIndex,
  updateCell,
} from './grid';

describe('grid coordinates', () => {
  it.each([1, 3, 5])(
    'round trips every index in a %i-column grid',
    (columns) => {
      const indices = Array.from({ length: columns * 4 }, (_, index) => index);

      const coordinates = indices.map((index) => ({
        row: getRowIndex(index, columns),
        column: getColumnIndex(index, columns),
      }));

      expect(
        coordinates.map(({ row, column }) => getIndex(row, column, columns))
      ).toEqual(indices);
      expect(coordinates[0]).toEqual({ row: 0, column: 0 });
      expect(coordinates.at(-1)).toEqual({ row: 3, column: columns - 1 });
    }
  );

  it('maps row and column to a row-major index', () => {
    const index = getIndex(2, 3, 5);

    expect(index).toBe(13);
    expect(getRowIndex(index, 5)).toBe(2);
    expect(getColumnIndex(index, 5)).toBe(3);
  });
});

describe('createMaze', () => {
  it('creates a rectangular maze of unvisited, fully walled cells', () => {
    const maze = createMaze({ columns: 4, rows: 2, startIndex: 5 });

    expect(maze).toMatchObject({
      columns: 4,
      rows: 2,
      startIndex: 5,
      endIndex: 7,
    });
    expect(maze.cells).toHaveLength(8);
    expect(maze.cells.map((cell) => cell.index)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(getCell(maze, 7)).toMatchObject({ row: 1, column: 3, isEnd: true });
    expect(maze.cells.filter((cell) => cell.isStart)).toEqual([
      getCell(maze, 5),
    ]);
    for (const cell of maze.cells) {
      expect(cell.walls).toEqual({
        Top: true,
        Right: true,
        Bottom: true,
        Left: true,
      });
      expect(cell).toMatchObject({
        visited: false,
        backtracked: false,
        lastVisitedAt: null,
        blocked: false,
      });
    }
  });

  it.each([
    [0, { Top: true, Right: false, Bottom: false, Left: true }],
    [1, { Top: true, Right: false, Bottom: false, Left: false }],
    [4, { Top: false, Right: false, Bottom: false, Left: false }],
    [8, { Top: false, Right: true, Bottom: true, Left: false }],
  ])('marks the outer edges of cell %i', (index, edges) => {
    const maze = createMaze({ columns: 3, rows: 3 });

    expect(getCell(maze, index).edges).toEqual(edges);
  });

  it.each([-1, 9])('rejects out-of-range start index %i', (startIndex) => {
    expect(() => createMaze({ columns: 3, rows: 3, startIndex })).toThrow(
      /out of range/
    );
  });

  it('rejects a blocked start cell', () => {
    expect(() =>
      createMaze({ columns: 3, rows: 3, blockedIndices: new Set([0]) })
    ).toThrow(/cannot be blocked/);
  });

  it('is serializable', () => {
    const maze = createMaze({ columns: 3, rows: 2 });

    expect(JSON.parse(JSON.stringify(maze))).toEqual(maze);
  });
});

describe('getCell', () => {
  it('returns the first and last cells', () => {
    const maze = createMaze({ columns: 3, rows: 3 });

    expect(getCell(maze, 0).index).toBe(0);
    expect(getCell(maze, 8).index).toBe(8);
  });
});

describe('neighbors', () => {
  it.each([
    [0, [1, 3]],
    [2, [5, 1]],
    [6, [3, 7]],
    [8, [5, 7]],
    [1, [2, 4, 0]],
    [4, [1, 5, 7, 3]],
  ])('only returns in-bounds neighbors of cell %i', (index, expected) => {
    const maze = createMaze({ columns: 3, rows: 3 });

    const neighbors = getNeighbors(maze, index);

    expect(neighbors.map((cell) => cell.index)).toEqual(expected);
  });

  it('handles a single row and a single cell', () => {
    expect(
      getNeighbors(createMaze({ columns: 3, rows: 1 }), 1).map((c) => c.index)
    ).toEqual([2, 0]);
    expect(getNeighbors(createMaze({ columns: 1, rows: 1 }), 0)).toEqual([]);
  });

  it('excludes visited and blocked neighbors from eligible neighbors', () => {
    const maze = updateCell(
      createMaze({ columns: 3, rows: 3, blockedIndices: new Set([1]) }),
      5,
      { visited: true }
    );

    const eligible = getEligibleNeighbors(maze, 4);

    expect(eligible.map((cell) => cell.index)).toEqual([7, 3]);
  });
});

describe('connect', () => {
  it.each([
    ['Top', 1, 'Bottom'],
    ['Right', 5, 'Left'],
    ['Bottom', 7, 'Top'],
    ['Left', 3, 'Right'],
  ] as const)(
    'opens the %s wall and its reciprocal wall',
    (wall, neighbor, reciprocal) => {
      const maze = createMaze({ columns: 3, rows: 3 });

      const connected = connect(maze, 4, neighbor);

      expect(getCell(connected, 4).walls).toEqual({
        ...getCell(maze, 4).walls,
        [wall]: false,
      });
      expect(getCell(connected, neighbor).walls).toEqual({
        ...getCell(maze, neighbor).walls,
        [reciprocal]: false,
      });
    }
  );

  it('returns a new maze and only replaces the two connected cells', () => {
    const maze = createMaze({ columns: 3, rows: 3 });

    const connected = connect(maze, 0, 1);

    expect(connected).not.toBe(maze);
    expect(getCell(maze, 0).walls.Right).toBe(true);
    connected.cells.forEach((cell, index) => {
      if (index > 1) expect(cell).toBe(maze.cells[index]);
      else expect(cell).not.toBe(maze.cells[index]);
    });
  });

  it.each([
    [0, 4],
    [2, 3],
    [0, 0],
  ])('rejects non-adjacent cells %i and %i', (a, b) => {
    const maze = createMaze({ columns: 3, rows: 3 });

    expect(() => connect(maze, a, b)).toThrow(/not adjacent/);
  });
});

describe('updateCell', () => {
  it('replaces one cell without mutating the original maze', () => {
    const maze = createMaze({ columns: 2, rows: 2 });

    const updated = updateCell(maze, 3, { visited: true, lastVisitedAt: 10 });

    expect(getCell(updated, 3)).toMatchObject({
      visited: true,
      lastVisitedAt: 10,
    });
    expect(getCell(maze, 3).visited).toBe(false);
    expect(updated.cells[0]).toBe(maze.cells[0]);
  });
});
