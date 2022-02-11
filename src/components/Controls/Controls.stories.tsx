import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Controls } from './Controls';

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

export const Idle = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Idle.args = {
  currentStateValue: 'idle',
};

export const Initialization = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Initialization.args = {
  currentStateValue: 'initialization',
};

export const Playing = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Playing.args = {
  currentStateValue: 'playing',
};

export const Paused = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Paused.args = {
  currentStateValue: 'paused',
};

export const Done = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Done.args = {
  currentStateValue: 'done',
};
