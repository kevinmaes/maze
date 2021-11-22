import { Reducer, useReducer, useMemo } from 'react';
import { ActionType } from 'typesafe-actions';

export function useTypesafeActions<
  S,
  Actions extends { [key: string]: (...args: any[]) => any }
>(
  reducer: Reducer<S, ActionType<Actions>>,
  initialState: S,
  actions: Actions
): [S, Actions] {
  const [state, dispatch] = useReducer(reducer, initialState);
  const boundActions = useMemo(() => {
    function bindActionCreator(
      actionCreator: (...args: any[]) => any,
      dispatcher: typeof dispatch
    ) {
      return function(this: any) {
        return dispatcher(
          actionCreator.apply(this as any, (arguments as unknown) as any[])
        );
      };
    }

    const newActions = Object.keys(actions).reduce((ba, actionName) => {
      ba[actionName] = bindActionCreator(actions[actionName], dispatch);
      return ba;
    }, {} as { [key: string]: (...args: any[]) => any });
    return newActions;
  }, [dispatch, actions]);
  return [state, boundActions as Actions];
}
