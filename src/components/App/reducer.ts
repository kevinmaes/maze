import { createAction, getType, ActionType } from 'typesafe-actions';

import { AppState } from './types';

export const Actions = {
  createPlayRequest: createAction('CREATE_PLAY_REQUEST')<number>(),
  setFPS: createAction('SET_FPS')<number>(),
  setCellSize: createAction('SET_CELL_SIZE')<number>(),
  setBorderWeight: createAction('SET_BORDER_WEIGHT')<number>(),
  setGridColumns: createAction('SET_GRID_COLUMNS')<number>(),
  setGridRows: createAction('SET_GRID_ROWS')<number>(),
  setSettingsChanging: createAction('SET_SETTINGS_CHANGING')<any>(),
};

export const reducer = (
  s: AppState,
  { type, payload }: ActionType<typeof Actions>
) => {
  switch (type) {
    case getType(Actions.createPlayRequest):
      return { ...s, playRequestTS: payload };
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
    case getType(Actions.setSettingsChanging):
      return { ...s, settingsChanging: payload };
    default:
      return s;
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
