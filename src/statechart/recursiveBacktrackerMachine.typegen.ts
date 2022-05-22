// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    play: 'PLAY';
    pause: 'PAUSE';
    initGeneration: 'START';
    visitStartCell: 'START';
    pushToStack: 'START' | '';
    findNeighbors:
      | 'PLAY'
      | 'STEP_FORWARD'
      | 'xstate.after(SEEK_INTERVAL)#generationAlgorithmMachine.start'
      | 'xstate.after(SEEK_INTERVAL)#generationAlgorithmMachine.advance'
      | '';
    pickNextCell: '';
    popFromStack: '';
  };
  internalEvents: {
    '': { type: '' };
    'xstate.after(SEEK_INTERVAL)#generationAlgorithmMachine.start': {
      type: 'xstate.after(SEEK_INTERVAL)#generationAlgorithmMachine.start';
    };
    'xstate.after(SEEK_INTERVAL)#generationAlgorithmMachine.advance': {
      type: 'xstate.after(SEEK_INTERVAL)#generationAlgorithmMachine.advance';
    };
    'xstate.init': { type: 'xstate.init' };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions:
      | 'play'
      | 'pause'
      | 'initGeneration'
      | 'visitStartCell'
      | 'pushToStack'
      | 'findNeighbors'
      | 'pickNextCell'
      | 'popFromStack';
    services: never;
    guards: 'isDeadEnd' | 'isBackAtStart';
    delays: 'SEEK_INTERVAL';
  };
  eventsCausingServices: {};
  eventsCausingGuards: {
    isDeadEnd: '';
    isBackAtStart: '';
  };
  eventsCausingDelays: {
    SEEK_INTERVAL: 'xstate.init';
  };
  matchesStates:
    | 'maze-idle'
    | 'start'
    | 'seek'
    | 'advance'
    | 'backtrack'
    | 'complete';
  tags: never;
}
