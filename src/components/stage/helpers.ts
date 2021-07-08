import Cell from '../../generation/Cell';
import { START_INDEX } from './constants';

interface GridArgs {
  canvasCtx: any;
  gridRef: any;
  cellTotal: number;
  cellSize: number;
  gridRows: number;
  gridColumns: number;
  borderWeight: number;
  endIndex: number;
}

export const createGrid = ({
  canvasCtx,
  cellTotal,
  cellSize,
  gridRows,
  gridColumns,
  gridRef,
  borderWeight,
  endIndex,
}: GridArgs) => {
  console.log('createGrid');
  const middleRowIndex = Math.floor(gridRows / 2);
  const middleIndex = middleRowIndex * gridColumns + middleRowIndex;

  for (let index = 0; index < cellTotal; index++) {
    const cell = new Cell({
      ctx: canvasCtx,
      index,
      colIndex: index % gridRef.current.cols,
      rowIndex: Math.floor(index / gridRef.current.cols),
      size: cellSize,
      borderWeight,
      visitedColor: 'rgb(208, 222, 247)',
      backtrackColor: '#fff',
      isStart: index === START_INDEX,
      isMiddle: index === middleIndex,
      isEnd: index === endIndex,
      renderInitial: true,
    });

    gridRef.current.cells.push(cell);
  }
};
