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

const CELL_SIZE = 10;
// const BORDER_WEIGHT = 0.1 * CELL_SIZE;
const BORDER_WEIGHT = 5;
const GRID_COLUMNS = 50;
const GRID_ROWS = 50;
const CELL_TOTAL = GRID_COLUMNS * GRID_ROWS;
const START_INDEX = 0;
const END_INDEX = CELL_TOTAL - 1;

const Stage = (props: Props) => {
  const {
    width = 100,
    height = 100,
    pixelRatio = window.devicePixelRatio,
    fps = 60,
  } = props;

  const [pathsAreConnected, setPathsAreConnected] = React.useState(false);
  const canvas: any = React.useRef(null);
  const currentCellARef = React.useRef<Cell | null>(null);
  const currentCellZRef = React.useRef<Cell | null>(null);
  const gridRef = React.useRef<Grid>(
    new Grid({ rows: GRID_ROWS, cols: GRID_COLUMNS })
  );
  const stackARef = React.useRef<Cell[]>([]);
  const stackZRef = React.useRef<Cell[]>([]);

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
            backtrackColor: '#fff',
            isStart: index === START_INDEX,
            isMiddle: index === middleIndex,
            isEnd: index === END_INDEX,
            renderInitial: true,
          });

          gridRef.current.cells.push(cell);
        }
      };

      createGrid(GRID_ROWS * GRID_COLUMNS, CELL_SIZE);
    }
  }, []);

  useAnimationFrame({ fps }, (deltaTime: number) => {
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

      // Seek path Z.
      currentCellZRef.current = seek({
        grid: gridRef.current,
        pathId: 'z',
        current: currentCellZRef.current,
        endIndex: END_INDEX,
        stack: stackZRef.current,
      });

      if (!pathsAreConnected && !currentCellARef.current) {
        const middleRowIndex = Math.floor(GRID_ROWS / 2);

        for (
          let i = middleRowIndex * GRID_COLUMNS;
          i < (middleRowIndex + 1) * GRID_COLUMNS;
          i++
        ) {
          const thisMiddleRowCell = gridRef.current.cells[i];
          const cellANeighbors = gridRef.current.getNeighbors(
            thisMiddleRowCell
          );

          if (cellANeighbors.length) {
            const otherPathNeighbor = cellANeighbors.find(cell =>
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

  return <canvas ref={canvas} width={dw} height={dh} style={style} />;
};

export default Stage;
