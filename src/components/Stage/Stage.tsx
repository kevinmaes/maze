import React, { Ref, useEffect, useRef } from 'react';
import { AppMachineEvent } from '../../statechart/app.machine';
import { GenerationParams } from '../../types';
import Grid from '../generation/Grid';
import { Canvas } from './Stage.css';

interface Props {
  generationParams: GenerationParams;
  width?: number;
  height?: number;
  pixelRatio?: number;
  send: (event: AppMachineEvent) => void;
  generationSessionId: number;
}

export function Stage({
  width = 100,
  height = 100,
  pixelRatio = window.devicePixelRatio,
  generationParams,
  send,
  generationSessionId,
}: Props) {
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
      // TODO: Can omit fps and send that directly from appMachine -> algo machine.
      send({ type: 'grid.inject', grid: gridRef.current });
    }
  }, [
    generationParams,
    height,
    width,
    borderWeight,
    cellSize,
    gridColumns,
    gridRows,
    send,
    generationSessionId,
  ]);

  const dw = Math.floor(pixelRatio * cellSize * gridColumns) + 2 * borderWeight;
  const dh = Math.floor(pixelRatio * cellSize * gridRows) + 2 * borderWeight;

  return <Canvas ref={canvasRef} width={dw} height={dh} />;
}
