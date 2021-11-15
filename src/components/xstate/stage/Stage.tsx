import React from 'react';

import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import Grid from '../generation/Grid';
import type { Grid as TGrid } from '../generation/Grid';
import Cell from '../generation/Cell';
import type { Cell as TCell } from '../generation/Cell';
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
  const [pathsAreConnected, setPathsAreConnected] = React.useState(false);
  const canvas: any = React.useRef(null);
  const gridRef = React.useRef<Grid>(
    new Grid({ cols: gridColumns, rows: gridRows })
  );

  const currentCellARef = React.useRef<Cell | null>(null);
  // const currentCellZRef = React.useRef<Cell | null>(null);
  const stackARef = React.useRef<Cell[]>([]);
  // const stackZRef = React.useRef<Cell[]>([]);

  const cellTotal = gridColumns * gridRows;

  const endIndex = cellTotal - 1;

  React.useEffect(() => {
    gridRef.current = new Grid({ cols: gridColumns, rows: gridRows });
    currentCellARef.current = null;
    // currentCellZRef.current = null;
    stackARef.current = [];
    // stackZRef.current = [];

    // Reset the pathsAreConnected when drawing this new maze.
    setPathsAreConnected(false);
  }, [playRequestTS, fps, cellSize, borderWeight, gridColumns, gridRows]);

  React.useEffect(() => {
    if (canvas && canvas.current && gridRef.current) {
      const canvasCtx = canvas.current.getContext('2d');

      canvasCtx.save();
      canvasCtx.scale(pixelRatio, pixelRatio);
      canvasCtx.fillStyle = 'hsl(0, 0%, 95%)';
      canvasCtx.fillRect(0, 0, width, height);

      const createGrid = (cellTotal: number, cellSize: number) => {
        // const middleColIndex = Math.floor(gridColumns / 2);
        const middleRowIndex = Math.floor(gridRef.current.getRows() / 2);
        const middleIndex =
          middleRowIndex * gridRef.current.getColumns() + middleRowIndex;

        for (let index = 0; index < cellTotal; index++) {
          const cell = new Cell({
            canvasCtx,
            index,
            colIndex: index % gridRef.current.getColumns(),
            rowIndex: Math.floor(index / gridRef.current.getRows()),
            size: cellSize,
            borderWeight,
            visitedColor: 'rgb(208, 222, 247)',
            backtrackColor: '#fff',
            isStart: index === START_INDEX,
            isMiddle: index === middleIndex,
            isEnd: index === endIndex,
            renderInitial: true,
          });

          // gridRef.current.cells.push(cell);
        }
      };

      createGrid(cellTotal, cellSize);
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
    // const canvasElement = canvas.current;
    if (canvas && canvas.current) {
      // if (canvas && canvasElement) {
      // Seek path A
      currentCellARef.current = seek({
        grid: gridRef.current,
        pathId: 'a',
        current: currentCellARef.current,
        startIndex: START_INDEX,
        stack: stackARef.current,
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
      // const gridRefElement: TGrid = gridRef.current as unknown as TGrid;

      // if (gridRefElement) {
      for (let cell of gridRef.current.getCells()) {
        cell.draw();
      }
      // }
    }
  });

  const dw = Math.floor(pixelRatio * width);
  const dh = Math.floor(pixelRatio * height);
  const style = { width, height, border: '1px solid black' };

  return <Canvas ref={canvas} width={dw} height={dh} style={style} />;
};

export default React.memo(Stage, (_, { settingsChanging }) => settingsChanging);
