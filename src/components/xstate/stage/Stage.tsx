import React from 'react';

import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import Grid from '../generation/Grid';
import Cell from '../generation/Cell';
import { seek } from '../generation/seek';
import { Canvas } from './Stage.css';

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

const START_INDEX = 0;

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
  // const [pathsAreConnected, setPathsAreConnected] = React.useState(false);
  const canvas: any = React.useRef(null);
  const gridRef = React.useRef<Grid>(
    new Grid({ cols: gridColumns, rows: gridRows })
  );

  const currentCellARef = React.useRef<Cell | null>(null);
  const stackARef = React.useRef<Cell[]>([]);

  const cellTotal = gridColumns * gridRows;

  const endIndex = cellTotal - 1;

  React.useEffect(() => {
    if (canvas && canvas.current && gridRef.current) {
      const canvasCtx = canvas.current.getContext('2d');

      canvasCtx.save();
      canvasCtx.scale(pixelRatio, pixelRatio);
      canvasCtx.fillStyle = 'hsl(0, 0%, 95%)';
      canvasCtx.fillRect(0, 0, width, height);

      gridRef.current = new Grid({
        cols: gridColumns,
        rows: gridRows,
        canvasCtx,
        cellSize,
        borderWeight,
      });
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
  ]);

  useAnimationFrame({ fps }, (deltaTime: number) => {
    if (canvas && canvas.current) {
      // Seek path A
      currentCellARef.current = seek({
        grid: gridRef.current,
        pathId: 'a',
        current: currentCellARef.current,
        startIndex: START_INDEX,
        // stack: stackARef.current,
      });

      // // Seek path Z.
      // currentCellZRef.current = seek({
      //   grid: gridRef.current,
      //   pathId: 'z',
      //   current: currentCellZRef.current,
      //   endIndex,
      //   stack: stackZRef.current,
      // });

      // if (!pathsAreConnected && !currentCellARef.current) {
      //   const middleRowIndex = Math.floor(gridRows / 2);

      //   for (
      //     let i = middleRowIndex * gridColumns;
      //     i < (middleRowIndex + 1) * gridColumns;
      //     i++
      //   ) {
      //     const thisMiddleRowCell = gridRef.current.cells[i];
      //     const cellANeighbors =
      //       gridRef.current.getNeighbors(thisMiddleRowCell);

      //     if (cellANeighbors.length) {
      //       const otherPathNeighbor = cellANeighbors.find((cell: TCell) =>
      //         cell.hasDifferentPathId(thisMiddleRowCell)
      //       );

      //       if (otherPathNeighbor) {
      //         thisMiddleRowCell.connect(otherPathNeighbor);
      //         setPathsAreConnected(true);
      //         // console.log(
      //         //   'Paths connect between indices:',
      //         //   thisMiddleRowCell.index,
      //         //   otherPathNeighbor.index
      //         // );
      //         break;
      //       }
      //     }
      //   }
      // }

      // Draw all cells.
      for (let cell of gridRef.current.getCells()) {
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
