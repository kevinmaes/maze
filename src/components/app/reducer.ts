import {
  createAction,
  getType,
  createStandardAction,
  ActionType,
} from 'typesafe-actions';

import { AppState } from './types';

export const Actions = {
  setFPS: createStandardAction('SET_FPS')<number>(),
};

export const reducer = (s: AppState, a: ActionType<typeof Actions>) => {
  switch (a.type) {
    case getType(Actions.setFPS):
      return { ...s, fps: a.payload };
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
