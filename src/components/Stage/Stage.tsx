import React from 'react';
import { useMachine } from '@xstate/react';

// Intentionally importing new DesignGrid (referring to it as Grid).
import Grid from '../generation/DesignGrid';

import { Canvas } from './Stage.css';
import { machine } from '../../statechart/statechart';

interface Props {
  playRequestTS: number;
  width?: number;
  height?: number;
  pixelRatio?: number;
  fps: number;
  cellSize: number;
  borderWeight: number;
  gridColumns: number;
  gridRows: number;
  settingsChanging: boolean;
}

// const START_INDEX = 0;

const Stage = ({
  playRequestTS,
  width = 100,
  height = 100,
  pixelRatio = window.devicePixelRatio,
  fps,
  cellSize,
  borderWeight,
  gridColumns,
  gridRows,
}: Props) => {
  const canvasRef: any = React.useRef(null);
  const gridRef = React.useRef<Grid>(
    new Grid({ cols: gridColumns, rows: gridRows })
    // new Grid({ cols: 10, rows: 10 })
  );

  // eslint-disable-next-line
  const [state, send] = useMachine(machine);

  const cellTotal = gridColumns * gridRows;

  const endIndex = cellTotal - 1;

  React.useEffect(() => {
    if (canvasRef && canvasRef.current && gridRef.current) {
      const canvasCtx = canvasRef.current.getContext('2d');
      canvasCtx.clearRect(0, 0, width, height);

      // var grd = canvasCtx.createLinearGradient(0, 0, width, 0);
      // grd.addColorStop(0, '#ECE9A8');
      // grd.addColorStop(0.5, '#E4C6E3');
      // grd.addColorStop(1, '#BCCDFE');
      // canvasCtx.fillStyle = grd;
      // canvasCtx.fillRect(0, 0, width, height);

      gridRef.current = new Grid({
        // cols: gridColumns,
        // rows: gridRows,
        cols: 20,
        rows: 20,
        canvasCtx,
        cellSize: 100,
        borderWeight: 50,
        // blockedCells: [50, 54, 65, 80, 95, 110, 69, 84, 99, 114, 66, 68, 82],
        blockedCells: [],
      });

      send('INJECT_REFS', { gridRef, fps });
    }
  }, [
    playRequestTS,
    fps,
    cellSize,
    borderWeight,
    cellTotal,
    gridColumns,
    gridRows,
    endIndex,
    height,
    pixelRatio,
    width,
    send,
  ]);

  if (gridRef.current && gridRef.current.canvasCtx) {
    gridRef.current.draw();
  }

  const dw = Math.floor(pixelRatio * width);
  const dh = Math.floor(pixelRatio * height);

  return <Canvas ref={canvasRef} width={dw} height={dh} />;
};

export default React.memo(Stage, (_, { settingsChanging }) => settingsChanging);
