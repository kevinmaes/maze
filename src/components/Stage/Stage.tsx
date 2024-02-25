import { useSelector } from '@xstate/react';
import React, { Ref, useEffect, useRef } from 'react';
import {
  AppMachineContext,
  AppMachineEvent,
} from '../../statechart/app.machine';
import { GenerationParams } from '../../types';
import Grid from '../generation/Grid';
import { Canvas } from './Stage.css';

interface Props {
  width?: number;
  height?: number;
  pixelRatio?: number;
}

export function Stage({
  width = 100,
  height = 100,
  pixelRatio = window.devicePixelRatio,
}: Props) {
  const actorRef = AppMachineContext.useActorRef();
  const { generationParams, generationSessionId } = useSelector(
    actorRef,
    (state) => ({
      generationParams: state.context.generationParams,
      generationSessionId: state.context.generationSessionId,
    })
  );
  const { cellSize, borderWeight, gridColumns, gridRows } = generationParams;

  const canvasRef: Ref<HTMLCanvasElement> = useRef(null);
  const gridRef = useRef<Grid | null>(null);

  useEffect(() => {
    if (canvasRef && canvasRef.current) {
      const canvasCtx = canvasRef.current.getContext(
        '2d'
      ) as CanvasRenderingContext2D;
      canvasCtx.clearRect(0, 0, width, height);

      gridRef.current = new Grid(
        canvasCtx,
        gridColumns,
        gridRows,
        0,
        cellSize,
        borderWeight
        // blockedCells: [50, 54, 65, 80, 95, 110, 69, 84, 99, 114, 66, 68, 82],
      );
      actorRef.send({ type: 'grid.inject', grid: gridRef.current });
    }
  }, [
    height,
    width,
    borderWeight,
    cellSize,
    gridColumns,
    gridRows,
    actorRef,
    generationSessionId,
  ]);

  const dw = Math.floor(pixelRatio * cellSize * gridColumns) + 2 * borderWeight;
  const dh = Math.floor(pixelRatio * cellSize * gridRows) + 2 * borderWeight;

  return <Canvas ref={canvasRef} width={dw} height={dh} />;
}
