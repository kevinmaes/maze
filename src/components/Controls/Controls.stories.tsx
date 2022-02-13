import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Controls } from './Controls';
import { PlaybackMachineState } from '../../statechart/playbackMachineTypes';

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

export const Idle = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Idle.args = {
  state: {
    matches: (arg: string) => arg === 'idle',
  },
};

export const Initialization = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Initialization.args = {
  state: {
    matches: (arg: string) => arg === 'initialization',
  },
};

export const Playing = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Playing.args = {
  state: {
    matches: (arg: string) => arg === 'generation.playing',
  },
};

export const Paused = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Paused.args = {
  state: {
    matches: (arg: string) => arg === 'generation.paused',
  },
};

export const Done = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Done.args = {
  state: {
    matches: (arg: string) => arg === 'done',
  },
};
