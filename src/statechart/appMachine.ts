import { createMachine } from 'xstate';
import {
  PlaybackContext,
  PlaybackEvent,
  Typestate,
} from './playbackMachineTypes';

export const machine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqA2BLAxsgLlgPYB2AdFhBmAMQAKAMgIICaioqRsWhp7IAD0QBaAGwAWAKxkA7FIBMogJyT5AZgCMMtQBoQATxEyAHErLHVy+QAYltjaYC+jvWky4CxclhI8sybAAvT1IaAVh8AjAyZAAzfDAAJzIASQA5FIAVAH10zIBRACUANSYGfk5uXhJ+IQQNOzIlcXkZeUkNSXEpST1DBGETcTI1ZutjUQ6TNvlnV3RsPGqyGBIkzxIoMkxkfR8oGgBlTKZCnIB5YqKKrj8+JEEReW6yDWtOuUljGQ01cfE+iJRGp5GRRNZ5A5RL9xL8ZEo5iA3IsQuRVutCJtthhdvt6EwAKqHfI3KpeWqIGQyMjqcTvNqiCSfDSAgaSZqvNTGUxfbkycazFxIhYeZboxIbLY7PabI6Zc50Ul3GoPOrCb7DaziOQODSiH50pSs4TiCYjb42D62cGSRHI0VeFZgNYSzFSnEyg5K6oUhBqU1kCETP6SUQWBzWXoGESm0RkcRKZTGcQgzRKLR2kVLR3iyXbZAAV1gkHozDYD0qyt9NlBmgc7OUGk66lExrUMmkWqp-tD8mM1m0okz7mzpCdLrzqELxYgcvydGyADFzoUAOqnAAi3vJqsQPbBSjUyn5-Lp2uNTekpo0NiUcm5KaUgvmI9R44x+3zRZL2-uoDqcb8mm8hKKYKZciGrJ-PGXKHmo-paIyVjDiiywQKQtDHKcFxXIUv4qv+Mahq82hHsmHRnimrJNmo5hal0JjKFqdgIoiJBEBAcD8Pao7eFQYD4b66omGCDJUsm8IUca8IaLIkYIVSkzgmoKEOmOPh+AEWDBD6Fa3LphEDN0oKmFS4gSB06hNtJyayA4zwQnY2idKpvHvq6n7Svsgm7ggoHmlqkbqF2IFGtGRnGLR7YTNYtjtnesIyK5b65m6X4zj5hk3tSib8tYR7QqRMgXhowyRQ4ozsqaEJtMlYrOh+myZY8CCSLRtL0ooTJSCy4ViPqrwCpIobTPyz7Cq+aEYc1dSWSM+WjIyXLcg41GMuabyRlqfbyIo4h1TuHD6YdLXCHYoL6oo4naiopXGhMwz6goij1g0Q7OI4QA */
  createMachine<PlaybackContext, PlaybackEvent, Typestate>(
    {
      context: { mazeId: '' },
      id: 'application',
      initial: 'idle',
      states: {
        idle: {
          on: {
            PLAY: {
              target: '#application.initialization',
            },
          },
        },
        initialization: {
          after: {
            INIT_INTERVAL: {
              target: '#application.generating',
            },
          },
        },
        generating: {
          initial: 'playing',
          states: {
            playing: {
              always: {
                cond: 'isFinished',
                target: '#application.done',
              },
              on: {
                START_OVER: {
                  target: '#application.initialization',
                },
                PAUSE: {
                  target: '#application.generating.paused',
                },
                STOP: {
                  target: '#application.idle',
                },
              },
            },
            paused: {
              always: {
                cond: 'isFinished',
                target: '#application.done',
              },
              on: {
                PLAY: {
                  target: '#application.generating.playing',
                },
                STEP_FORWARD: {
                  target: '#application.generating.paused',
                },
              },
            },
          },
        },
        done: {
          on: {
            START_OVER: {
              target: '#application.initialization',
            },
          },
        },
      },
    },
    {
      guards: {
        isFinished: (context, event) => false,
      },
      delays: {
        INIT_INTERVAL: () => {
          return 1000;
        },
      },
    }
  );
