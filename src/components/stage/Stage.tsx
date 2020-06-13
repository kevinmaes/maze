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

interface Canvas {
  current?: {
    getContext?: Function;
  };
}

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
  const canvas: any = React.useRef(null);
  const gridRef = React.useRef<Grid>(
    new Grid({ cols: gridColumns, rows: gridRows })
  );

  const currentCellARef = React.useRef<Cell | null>(null);
  const currentCellZRef = React.useRef<Cell | null>(null);
  const stackARef = React.useRef<Cell[]>([]);
  const stackZRef = React.useRef<Cell[]>([]);

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

    gridRef.current = new Grid({ cols: gridColumns, rows: gridRows });
    currentCellARef.current = null;
    currentCellZRef.current = null;
    stackARef.current = [];
    stackZRef.current = [];

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
  ]);

  useAnimationFrame({ fps }, (deltaTime: number) => {
    if (canvas && canvas.current) {
      // Seek path A
      currentCellARef.current = seek({
        grid: gridRef.current,
        pathId: 'a',
        current: currentCellARef.current,
        startIndex: START_INDEX,
        stack: stackARef.current,
      });

      // Seek path Z.
      currentCellZRef.current = seek({
        grid: gridRef.current,
        pathId: 'z',
        current: currentCellZRef.current,
        endIndex,
        stack: stackZRef.current,
      });

      if (!pathsAreConnected && !currentCellARef.current) {
        const middleRowIndex = Math.floor(gridRows / 2);

        for (
          let i = middleRowIndex * gridColumns;
          i < (middleRowIndex + 1) * gridColumns;
          i++
        ) {
          const thisMiddleRowCell = gridRef.current.cells[i];
          const cellANeighbors = gridRef.current.getNeighbors(
            thisMiddleRowCell
          );

          if (cellANeighbors.length) {
            const otherPathNeighbor = cellANeighbors.find((cell) =>
              cell.hasDifferentPathId(thisMiddleRowCell)
            );

            if (otherPathNeighbor) {
              thisMiddleRowCell.connect(otherPathNeighbor);
              setPathsAreConnected(true);
              // console.log(
              //   'Paths connect between indices:',
              //   thisMiddleRowCell.index,
              //   otherPathNeighbor.index
              // );
              break;
            }
          }
        }
      }

      // Draw all cells.
      for (let cell of gridRef.current.cells) {
        cell.draw();
      }
    }
  });

  const dw = Math.floor(pixelRatio * width);
  const dh = Math.floor(pixelRatio * height);
  const style = { width, height, border: '1px solid black' };

  return <Canvas ref={canvas} width={dw} height={dh} style={style} />;
};

export default React.memo(Stage, (_, { settingsChanging }) => settingsChanging);
