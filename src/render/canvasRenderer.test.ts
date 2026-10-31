import { describe, expect, it, vi } from 'vitest';
import { connect, createMaze, updateCell } from '../maze/grid';
import type { Maze } from '../maze/types';
import { drawMaze, getMazeSize } from './canvasRenderer';
import type { MazeStyle } from './mazeStyle';

const style: MazeStyle = {
  backtrackColor: 'backtrack',
  borderColor: 'border',
  cursorColor: 'cursor',
  edgeColor: 'edge',
  unvisitedColor: 'unvisited',
  visitedRgb: '1, 2, 3',
  visitedAlpha: 0.4,
  borderWeight: 1,
  cellSize: 20,
};

interface Call {
  name: string;
  args: number[];
  fillStyle: string;
  strokeStyle: string;
}

/** A 2D context that records every call with the styles active at the time. */
function recordingContext() {
  const calls: Call[] = [];
  const ctx: Record<string, unknown> = {
    canvas: { width: 130, height: 130 },
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
  };
  for (const name of [
    'save',
    'restore',
    'scale',
    'clearRect',
    'fillRect',
    'beginPath',
    'moveTo',
    'lineTo',
    'stroke',
  ]) {
    ctx[name] = vi.fn((...args: number[]) =>
      calls.push({
        name,
        args,
        fillStyle: ctx.fillStyle as string,
        strokeStyle: ctx.strokeStyle as string,
      })
    );
  }
  return { ctx: ctx as unknown as CanvasRenderingContext2D, calls };
}

function render(maze: Maze, options: Partial<Parameters<typeof drawMaze>[2]>) {
  const { ctx, calls } = recordingContext();
  drawMaze(ctx, maze, { style, now: 0, ...options });
  const fills = calls
    .filter((call) => call.name === 'fillRect')
    .map(({ args, fillStyle }) => [...args, fillStyle]);
  const lines = calls.flatMap((call, index) => {
    const next = calls[index + 1];
    return call.name === 'moveTo' && next?.name === 'lineTo'
      ? [[...call.args, ...next.args, next.strokeStyle]]
      : [];
  });
  return { ctx, calls, fills, lines };
}

// Cell 4 of a 3x3 maze sits at row 1, column 1: x = y = 1 * 20 + 1.
const center = createMaze({ columns: 3, rows: 3 });

describe('drawMaze', () => {
  it.each([1, 2, 3])(
    'clears the backing store and scales once for DPR %i',
    (devicePixelRatio) => {
      const { ctx, calls } = render(center, { devicePixelRatio });

      expect(calls.map((call) => call.name).slice(0, 3)).toEqual([
        'save',
        'clearRect',
        'scale',
      ]);
      expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 130, 130);
      expect(ctx.scale).toHaveBeenCalledOnce();
      expect(ctx.scale).toHaveBeenCalledWith(
        devicePixelRatio,
        devicePixelRatio
      );
      expect(calls.at(-1)?.name).toBe('restore');
      expect(ctx.lineWidth).toBe(style.borderWeight);
    }
  );

  it('defaults to a device pixel ratio of 1', () => {
    const { ctx } = render(center, {});

    expect(ctx.scale).toHaveBeenCalledWith(1, 1);
  });

  it('draws every wall of an inner cell in the border color', () => {
    const { lines } = render(center, {});

    expect(lines).toEqual(
      expect.arrayContaining([
        [21, 21, 41, 21, 'border'],
        [41, 21, 41, 41, 'border'],
        [21, 41, 41, 41, 'border'],
        [21, 21, 21, 41, 'border'],
      ])
    );
  });

  it('opens the start (left) and end (right) walls and colors edges', () => {
    const { lines } = render(center, {});

    // Start cell 0: top and left edges, but the left one is the entrance.
    expect(lines).toContainEqual([1, 1, 21, 1, 'edge']);
    expect(lines).not.toContainEqual([1, 1, 1, 21, 'edge']);
    // End cell 8: right and bottom edges, but the right one is the exit.
    expect(lines).toContainEqual([41, 61, 61, 61, 'edge']);
    expect(lines).not.toContainEqual([61, 41, 61, 61, 'edge']);
    // Other edge cells keep their outer walls.
    expect(lines).toContainEqual([1, 21, 1, 41, 'edge']);
    expect(lines).toContainEqual([61, 21, 61, 41, 'edge']);
    // 3x3: 12 horizontal + 12 vertical segments, minus the entrance and exit.
    expect(lines).toHaveLength(9 * 4 - 2);
  });

  it('skips walls removed by connect', () => {
    const { lines } = render(connect(center, 4, 5), {});

    expect(lines).not.toContainEqual([41, 21, 41, 41, 'border']);
    expect(lines).toHaveLength(9 * 4 - 2 - 2);
  });

  it('draws the cursor as a visited fill with an inner square', () => {
    const maze = updateCell(center, 4, { visited: true, lastVisitedAt: 0 });

    const { fills } = render(maze, { cursorIndex: 4, now: 10_000 });

    expect(fills).toContainEqual([21.5, 21.5, 20, 20, 'rgba(1, 2, 3, 0.4)']);
    expect(fills).toContainEqual([25.5, 25.5, 10, 10, 'cursor']);
    expect(fills).toHaveLength(10);
  });

  it('fades visited cells over time and keeps other fills constant', () => {
    let maze = updateCell(center, 0, { visited: true, lastVisitedAt: 1_000 });
    maze = updateCell(maze, 1, {
      visited: true,
      backtracked: true,
      lastVisitedAt: 1_000,
    });
    maze = updateCell(maze, 2, { visited: true });

    const { fills } = render(maze, { now: 5_000 });

    expect(fills[0]).toEqual([1.5, 1.5, 20, 20, 'rgba(1, 2, 3, 0.2)']);
    expect(fills[1]).toEqual([21.5, 1.5, 20, 20, 'backtrack']);
    expect(fills[2]).toEqual([41.5, 1.5, 20, 20, 'rgba(1, 2, 3, 0.4)']);
    expect(fills[3]).toEqual([1.5, 21.5, 20, 20, 'unvisited']);
  });

  it('fills blocked cells with the border color and draws no walls', () => {
    const maze = createMaze({
      columns: 3,
      rows: 3,
      blockedIndices: new Set([4]),
    });

    const { fills, lines } = render(maze, { cursorIndex: 4 });

    expect(fills[4]).toEqual([21.5, 21.5, 20, 20, 'border']);
    expect(fills).toHaveLength(9);
    expect(lines).toHaveLength(9 * 4 - 2 - 4);
  });
});

describe('getMazeSize', () => {
  it('adds the border weight on both sides', () => {
    expect(
      getMazeSize({ columns: 15, rows: 10 }, { cellSize: 20, borderWeight: 2 })
    ).toEqual({ width: 304, height: 204 });
  });
});
