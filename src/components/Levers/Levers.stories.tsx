import { ComponentStory, ComponentMeta } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { Levers } from './Levers';
import { defaultGenerationParams } from '../../statechart/appMachine';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Levers',
  component: Levers,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as ComponentMeta<typeof Levers>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Levers> = (args) => <Levers {...args} />;

export const Enabled = Template.bind({});
Enabled.args = {
  enabled: true,
  params: defaultGenerationParams,
  updateFromLevers: action('changed'),
};

export const Disabled = Template.bind({});
Disabled.args = {
  enabled: false,
  params: defaultGenerationParams,
};
