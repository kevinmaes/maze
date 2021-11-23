import React from 'react';
import { useMachine } from '@xstate/react';

import Grid from '../generation/Grid';
import Cell, { CellMethods } from '../generation/Cell';
import { seek } from '../generation/seek';
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
  const canvasRef: any = React.useRef(null);
  const gridRef = React.useRef<Grid>(
    new Grid({ cols: gridColumns, rows: gridRows })
  );
  // let canvasCtx: any;

  // const [state, send] = useMachine(machine, {
  //   actions: {
  //     injectRefs: () => {},
  //   },
  // });
  const [state, send] = useMachine(machine);

  // console.log(
  //   'current state value',
  //   state.value,
  //   (state.context.currentCell as CellMethods)?.getIndex()
  // );

  const currentCellARef = React.useRef<Cell | null>(null);
  const stackARef = React.useRef<Cell[]>([]);

  const cellTotal = gridColumns * gridRows;

  const endIndex = cellTotal - 1;

  // React.useEffect(() => {
  //   const machine = createMazeGenerationMachine({
  //     grid: gridRef.current,
  //   });
  // }, []);

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
  ]);

  // useAnimationFrame({ fps }, (deltaTime: number) => {
  //   if (canvas && canvas.current) {
  //     // Seek path A
  //     currentCellARef.current = seek({
  //       grid: gridRef.current,
  //       pathId: 'a',
  //       current: currentCellARef.current,
  //       startIndex: START_INDEX,
  //       // stack: stackARef.current,
  //     });

  //     // // Seek path Z.
  //     // currentCellZRef.current = seek({
  //     //   grid: gridRef.current,
  //     //   pathId: 'z',
  //     //   current: currentCellZRef.current,
  //     //   endIndex,
  //     //   stack: stackZRef.current,
  //     // });

  //     // if (!pathsAreConnected && !currentCellARef.current) {
  //     //   const middleRowIndex = Math.floor(gridRows / 2);

  //     //   for (
  //     //     let i = middleRowIndex * gridColumns;
  //     //     i < (middleRowIndex + 1) * gridColumns;
  //     //     i++
  //     //   ) {
  //     //     const thisMiddleRowCell = gridRef.current.cells[i];
  //     //     const cellANeighbors =
  //     //       gridRef.current.getNeighbors(thisMiddleRowCell);

  //     //     if (cellANeighbors.length) {
  //     //       const otherPathNeighbor = cellANeighbors.find((cell: TCell) =>
  //     //         cell.hasDifferentPathId(thisMiddleRowCell)
  //     //       );

  //     //       if (otherPathNeighbor) {
  //     //         thisMiddleRowCell.connect(otherPathNeighbor);
  //     //         setPathsAreConnected(true);
  //     //         // console.log(
  //     //         //   'Paths connect between indices:',
  //     //         //   thisMiddleRowCell.index,
  //     //         //   otherPathNeighbor.index
  //     //         // );
  //     //         break;
  //     //       }
  //     //     }
  //     //   }
  //     // }

  if (gridRef.current && gridRef.current.canvasCtx) {
    gridRef.current.draw();
  }

  const dw = Math.floor(pixelRatio * width);
  const dh = Math.floor(pixelRatio * height);

  return <Canvas ref={canvasRef} width={dw} height={dh} />;
};

export default React.memo(Stage, (_, { settingsChanging }) => settingsChanging);
