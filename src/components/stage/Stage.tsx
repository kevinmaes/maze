import React from 'react';

import { useAnimationFrame } from '../hooks/useAnimationFrame';
import Grid from '../../generation/Grid';
import Cell from '../../generation/Cell';
import { seek } from '../../generation/seek';
import { Canvas } from './Stage.css';
import { AppContext } from '../app/App';
import { createGrid } from './helpers';
import { START_INDEX } from './constants';

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

// interface ICanvas {
//   current?: {
//     getContext?: Function;
//   };
// }

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
  const {
    machine: { current, send },
  } = React.useContext(AppContext);
  console.log('State state', current.value);

  const [pathsAreConnected, setPathsAreConnected] = React.useState(false);
  const gridRef = React.useRef<Grid>(
    new Grid({ cols: gridColumns, rows: gridRows })
  );

  const currentCellARef = React.useRef<Cell | null>(null);
  const stackARef = React.useRef<Cell[]>([]);

  const cellTotal = gridColumns * gridRows;

  const endIndex = cellTotal - 1;

  const createGridCallback = React.useCallback(createGrid, [
    borderWeight,
    endIndex,
    gridColumns,
    gridRows,
  ]);

  React.useEffect(() => {
    console.log('Initialization effect start');
    const canvas: any = React.useRef(null);

    gridRef.current = new Grid({ cols: gridColumns, rows: gridRows });
    currentCellARef.current = null;
    stackARef.current = [];

    // Reset the pathsAreConnected when drawing this new maze.
    setPathsAreConnected(false);

    const canvasCtx = canvas.current.getContext('2d');

    canvasCtx.save();
    canvasCtx.scale(pixelRatio, pixelRatio);
    canvasCtx.fillStyle = 'hsl(0, 0%, 95%)';
    canvasCtx.fillRect(0, 0, width, height);

    createGridCallback({
      canvasCtx,
      cellTotal,
      cellSize,
      gridRows,
      gridColumns,
      gridRef,
      borderWeight,
      endIndex,
    });

    console.log('Initialization effect end');
    send('START');
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
    createGridCallback,
    send,
  ]);

  // useAnimationFrame({ fps }, (deltaTime: number) => {
  //   if (canvas && canvas.current) {
  //     currentCellARef.current = seek({
  //       grid: gridRef.current,
  //       pathId: 'a',
  //       current: currentCellARef.current,
  //       startIndex: START_INDEX,
  //       stack: stackARef.current,
  //     });

  //     // Draw all cells.
  //     for (let cell of gridRef.current.cells) {
  //       cell.draw();
  //     }
  //   }
  // });

  const dw = Math.floor(pixelRatio * width);
  const dh = Math.floor(pixelRatio * height);
  const style = { width, height, border: '1px solid black' };

  return <Canvas ref={canvas} width={dw} height={dh} style={style} />;
};

export default React.memo(Stage, (_, { settingsChanging }) => settingsChanging);
