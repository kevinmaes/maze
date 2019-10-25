import React from 'react';

import { useAnimationFrame } from '../hooks/useAnimationFrame';
import Grid from '../../generation/Grid';
import Cell from '../../generation/Cell';
import { seek } from '../../generation/seek';

interface Props {
  width?: number;
  height?: number;
  pixelRatio?: number;
  fps?: number;
}

interface Canvas {
  current?: {
    getContext?: Function;
  };
}

interface RequestRef {
  current: Number | undefined;
}

let count = 0;

const CELL_SIZE = 100;
// const BORDER_WEIGHT = 0.5 * CELL_SIZE;
const BORDER_WEIGHT = 2;
const GRID_COLUMNS = 4;
const GRID_ROWS = 4;
const CELL_TOTAL = GRID_COLUMNS * GRID_ROWS;
const START_INDEX = 0;
const END_INDEX = CELL_TOTAL - 1;

const Stage = (props: Props) => {
  // Declare a new state variable, which we'll call "count"
  const {
    width = 100,
    height = 100,
    pixelRatio = window.devicePixelRatio,
    fps = 60,
  } = props;

  const canvas: any = React.useRef(null);
  const currentCellARef = React.useRef<Cell | null>(null);
  const gridRef = React.useRef<Grid>(
    new Grid({ rows: GRID_ROWS, cols: GRID_COLUMNS })
  );
  const stackARef = React.useRef<Cell[]>([]);

  React.useEffect(() => {
    if (canvas && canvas.current && gridRef.current) {
      const ctx = canvas.current.getContext('2d');

      ctx.save();
      ctx.scale(pixelRatio, pixelRatio);
      ctx.fillStyle = 'hsl(0, 0%, 95%)';
      ctx.fillRect(0, 0, width, height);

      const createGrid = (cellTotal: number, cellSize: number) => {
        // const middleColIndex = Math.floor(GRID_COLUMNS / 2);
        const middleRowIndex = Math.floor(GRID_ROWS / 2);
        const middleIndex = middleRowIndex * GRID_COLUMNS + middleRowIndex;

        for (let index = 0; index < cellTotal; index++) {
          const cell = new Cell({
            ctx,
            index,
            colIndex: index % gridRef.current.cols,
            rowIndex: Math.floor(index / gridRef.current.cols),
            size: cellSize,
            borderWeight: BORDER_WEIGHT,
            visitedColor: 'rgb(208, 222, 247)',
            isStart: index === START_INDEX,
            isMiddle: index === middleIndex,
            isEnd: index === END_INDEX,
            renderInitial: true,
          });

          gridRef.current.cells.push(cell);
        }

        // Draw all cells.
        for (let cell of gridRef.current.cells) {
          cell.draw();
        }
      };

      createGrid(GRID_ROWS * GRID_COLUMNS, CELL_SIZE);
    }
  }, []);

  useAnimationFrame({ fps }, (deltaTime: number) => {
    // console.log({ deltaTime });

    if (canvas && canvas.current) {
      const ctx = canvas.current.getContext('2d');

      // Seek path A
      currentCellARef.current = seek({
        grid: gridRef.current,
        pathId: 'a',
        current: currentCellARef.current,
        startIndex: START_INDEX,
        stack: stackARef.current,
      });

      // console.log(
      //   'currentCell and stack:',
      //   currentCellARef.current,
      //   stackARef.current
      // );
    }
  });

  const dw = Math.floor(pixelRatio * width);
  const dh = Math.floor(pixelRatio * height);
  const style = { width, height, border: '4px solid red' };

  return <canvas ref={canvas} width={dw} height={dh} style={style} />;
};

export default Stage;
