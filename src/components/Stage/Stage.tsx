import React from 'react';

import Grid from '../generation/Grid';
import { Canvas } from './Stage.css';
// import { recursiveBacktrakerMachine } from '../../statechart/recursiveBacktrackerMachine';
import {
  AppMachineEventId,
  GenerationParams,
} from '../../statechart/appMachineTypes';

interface Props {
  generationParams: GenerationParams;
  width?: number;
  height?: number;
  pixelRatio?: number;
  appSend: Function;
  generationSessionId: number;
}

export const Stage = ({
  width = 100,
  height = 100,
  pixelRatio = window.devicePixelRatio,
  generationParams,
  appSend,
  generationSessionId,
}: Props) => {
  const { fps, cellSize, borderWeight, gridColumns, gridRows } =
    generationParams;
  const canvasRef: any = React.useRef(null);
  const gridRef = React.useRef<Grid>(
    new Grid({ cols: gridColumns, rows: gridRows })
  );

  // eslint-disable-next-line
  // const [_, send] = useMachine(recursiveBacktrakerMachine);

  const cellTotal = gridColumns * gridRows;

  const endIndex = cellTotal - 1;

  React.useEffect(() => {
    if (canvasRef && canvasRef.current && gridRef.current) {
      const canvasCtx = canvasRef.current.getContext('2d');
      canvasCtx.clearRect(0, 0, width, height);

      gridRef.current = new Grid({
        cols: gridColumns,
        rows: gridRows,
        canvasCtx,
        cellSize,
        borderWeight,
        // blockedCells: [50, 54, 65, 80, 95, 110, 69, 84, 99, 114, 66, 68, 82],
        blockedCells: [],
      });
      // TODO: Can omit fps and send that directly from appMachine -> algo machine.
      appSend(AppMachineEventId.INJECT_REFS, { gridRef });
    }
  }, [
    fps,
    cellSize,
    borderWeight,
    cellTotal,
    gridColumns,
    gridRows,
    endIndex,
    height,
    width,
    appSend,
    generationSessionId,
  ]);

  if (gridRef.current && gridRef.current.canvasCtx) {
    gridRef.current.draw();
  }

  const dw = Math.floor(pixelRatio * cellSize * gridColumns) + 2 * borderWeight;
  const dh = Math.floor(pixelRatio * cellSize * gridRows) + 2 * borderWeight;

  return <Canvas ref={canvasRef} width={dw} height={dh} />;
};
