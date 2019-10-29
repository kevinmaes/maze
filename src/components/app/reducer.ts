import {
  createAction,
  getType,
  createStandardAction,
  ActionType,
} from 'typesafe-actions';

import { AppState } from './types';

export const Actions = {
  setFPS: createStandardAction('SET_FPS')<number>(),
  setCellSize: createStandardAction('SET_SELL_SIZE')<number>(),
  setBorderWeight: createStandardAction('SET_BORDER_WEIGHT')<number>(),
  setGridColumns: createStandardAction('SET_GRID_COLUMNS')<number>(),
  setGridRows: createStandardAction('SET_GRID_ROWS')<number>(),
};

export const reducer = (
  s: AppState,
  { type, payload }: ActionType<typeof Actions>
) => {
  switch (type) {
    case getType(Actions.setFPS):
      return { ...s, fps: payload };
    case getType(Actions.setCellSize):
      return { ...s, cellSize: payload };
    case getType(Actions.setBorderWeight):
      return { ...s, borderWeight: payload };
    case getType(Actions.setGridColumns):
      return { ...s, gridColumns: payload };
    case getType(Actions.setGridRows):
      return { ...s, gridRows: payload };
  }
};

// import { unionize, ofType, UnionOf } from "unionize";
// const Actions = unionize({
//   increment: {},
//   decrement: {},
//   reset: {},
//   setValue: ofType<{ value: number }>()
// });

// const reducer = (s: State, a: UnionOf<typeof Actions>) =>
//   Actions.match(a, {
//     increment: () => ({ counter: s.counter + 1 }),
//     decrement: () => ({ counter: s.counter - 1 }),
//     reset: () => ({ counter: 0 }),
//     setValue: a => ({ counter: a.value }),
//     default: () => s
//   });
