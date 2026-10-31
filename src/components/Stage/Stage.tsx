import { useSelector } from '@xstate/react';
import { useEffect, useRef } from 'react';
import type { Subscription } from 'xstate';
import { drawMaze, getMazeSize } from '../../render/canvasRenderer';
import { mazePalette } from '../../render/mazeStyle';
import { AppMachineContext } from '../../statechart/app.machine';
import { Canvas } from './Stage.css';

export function Stage() {
  const actorRef = AppMachineContext.useActorRef();
  const { cellSize, borderWeight, gridColumns, gridRows } = useSelector(
    actorRef,
    (state) => state.context.generationParams
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const devicePixelRatio = window.devicePixelRatio || 1;
  const { width, height } = getMazeSize(
    { columns: gridColumns, rows: gridRows },
    { cellSize, borderWeight }
  );

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) {
      return;
    }
    const style = { ...mazePalette, cellSize, borderWeight };
    let frameId: number | null = null;

    const draw = () => {
      frameId = null;
      const snapshot = actorRef.getSnapshot();
      const generation =
        snapshot.children.generationAlgorithm?.getSnapshot().context.generation;
      drawMaze(ctx, generation?.maze ?? snapshot.context.maze, {
        style,
        cursorIndex: generation?.cursorIndex,
        now: Date.now(),
        devicePixelRatio,
      });
    };

    // Coalesce snapshots so the canvas redraws at most once per frame.
    const scheduleDraw = () => {
      frameId ??= requestAnimationFrame(draw);
    };

    // Follow the algorithm actor, which is replaced on every new maze.
    let algorithmActor = actorRef.getSnapshot().children.generationAlgorithm;
    let algorithmSubscription: Subscription | undefined =
      algorithmActor?.subscribe(scheduleDraw);
    const appSubscription = actorRef.subscribe((snapshot) => {
      const next = snapshot.children.generationAlgorithm;
      if (next !== algorithmActor) {
        algorithmSubscription?.unsubscribe();
        algorithmActor = next;
        algorithmSubscription = next?.subscribe(scheduleDraw);
      }
      scheduleDraw();
    });
    scheduleDraw();

    return () => {
      appSubscription.unsubscribe();
      algorithmSubscription?.unsubscribe();
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [actorRef, cellSize, borderWeight, devicePixelRatio]);

  return (
    <Canvas
      ref={canvasRef}
      width={Math.floor(width * devicePixelRatio)}
      height={Math.floor(height * devicePixelRatio)}
      style={{ width, height }}
    />
  );
}
