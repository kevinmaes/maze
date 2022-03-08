import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Controls } from './Controls';
import {
  AppMachineEventId,
  AppMachineState,
} from '../../statechart/appMachineTypes';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Controls',
  component: Controls,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof Controls>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Controls> = (args) => (
  <Controls {...args} />
);

// const mockState = {
//   matches: () => true,
// };

type StateValue =
  | string
  | {
      generating: string;
    };

export const Idle = Template.bind({});
Idle.args = {
  state: {
    can: (arg: AppMachineEventId) => false,
  },
};

export const Initializing = Template.bind({});
Initializing.args = {
  state: {
    can: (arg: AppMachineEventId) => arg === AppMachineEventId.PLAY,
  },
};

export const Playing = Template.bind({});
Playing.args = {
  state: {
    can: (arg: AppMachineEventId) =>
      arg === AppMachineEventId.PAUSE || arg === AppMachineEventId.STOP,
  },
};

export const Paused = Template.bind({});
Paused.args = {
  state: {
    can: (arg: AppMachineEventId) =>
      arg === AppMachineEventId.PLAY || arg === AppMachineEventId.STEP_FORWARD,
  },
};

export const Done = Template.bind({});
Done.args = {
  state: {
    can: (arg: AppMachineEventId) => arg === AppMachineEventId.START_OVER,
  },
};
