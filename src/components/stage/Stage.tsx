import React, { useRef, useEffect } from 'react';

import { useAnimationFrame } from '../hooks/useAnimationFrame';
import Grid from '../../generation/Grid';
import Cell from '../../generation/Cell';

interface Props {
  width?: number;
  height?: number;
  pixelRatio?: number;
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
const GRID_COLUMNS = 2;
const GRID_ROWS = 2;
const CELL_TOTAL = GRID_COLUMNS * GRID_ROWS;
const START_INDEX = 0;
const END_INDEX = CELL_TOTAL - 1;

const Stage = (props: Props) => {
  // Declare a new state variable, which we'll call "count"
  const {
    width = 100,
    height = 100,
    pixelRatio = window.devicePixelRatio,
  } = props;

  const canvas: any = useRef(null);

  useEffect(() => {
    if (canvas && canvas.current) {
      const ctx = canvas.current.getContext('2d');

      ctx.save();
      ctx.scale(pixelRatio, pixelRatio);
      ctx.fillStyle = 'hsl(0, 0%, 95%)';
      ctx.fillRect(0, 0, width, height);

      const grid = new Grid({ rows: GRID_ROWS, cols: GRID_COLUMNS });

      const createGrid = (cellTotal: number, cellSize: number) => {
        // const middleColIndex = Math.floor(GRID_COLUMNS / 2);
        const middleRowIndex = Math.floor(GRID_ROWS / 2);
        const middleIndex = middleRowIndex * GRID_COLUMNS + middleRowIndex;

        for (let index = 0; index < cellTotal; index++) {
          const cell = new Cell({
            ctx,
            index,
            colIndex: index % grid.cols,
            rowIndex: Math.floor(index / grid.cols),
            size: cellSize,
            borderWeight: BORDER_WEIGHT,
            visitedColor: 'rgb(208, 222, 247)',
            isStart: index === START_INDEX,
            isMiddle: index === middleIndex,
            isEnd: index === END_INDEX,
            renderInitial: true,
          });

          grid.cells.push(cell);
        }

        // Draw all cells.
        for (let cell of grid.cells) {
          cell.draw();
        }
      };

      createGrid(GRID_ROWS * GRID_COLUMNS, CELL_SIZE);
    }
  }, []);

  useAnimationFrame({ fps: 5 }, (deltaTime: number) => {
    // console.log({ deltaTime });

    if (canvas && canvas.current) {
      const context = canvas.current.getContext('2d');

      // context.save();
      // context.fillStyle = 'hsl(0, 0%, 95%)';

      // context.strokeStyle = 'blue';
      // context.beginPath();
      // context.arc(
      //   (Math.random() * width) / 2,
      //   (Math.random() * height) / 2,
      //   width / 4,
      //   0,
      //   Math.PI * 2
      // );
      // context.stroke();
      // context.restore();
    }
  });

  const dw = Math.floor(pixelRatio * width);
  const dh = Math.floor(pixelRatio * height);
  const style = { width, height, border: '4px solid red' };

  return <canvas ref={canvas} width={dw} height={dh} style={style} />;
};

export default Stage;
