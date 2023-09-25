import React, { InputHTMLAttributes } from 'react';

import { Fieldset, Form } from './Levers.css';
import { GenerationParams } from '../../types';

const CellSize = {
  DEFAULT: 20,
  MIN: 10,
  MAX: 25,
};

interface Props {
  enabled: boolean;
  params: GenerationParams;
  updateFromLevers: (data: { name: string; value: number }) => void;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: keyof GenerationParams;
}
function GenerationParamInput(inputProps: InputProps) {
  return <input {...inputProps} />;
}

export function Levers({ enabled, params, updateFromLevers }: Props) {
  const onLeverChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) =>
    updateFromLevers({ name, value: parseInt(value, 10) });

  const inputHandlers = { onChange: onLeverChange };

  return (
    <Form>
      <Fieldset disabled={!enabled} data-test-id="levers-fieldset">
        <div>
          <label htmlFor="fps">FPS ({params.fps})</label>
          <GenerationParamInput
            id="fps"
            type="range"
            name="fps"
            value={params.fps}
            min="1"
            max="60"
            step={1}
            {...inputHandlers}
          />
        </div>
        <div>
          <label htmlFor="cellSize">Cell Size ({params.cellSize})</label>
          <input
            id="cellSize"
            type="range"
            name="cellSize"
            value={params.cellSize}
            min={CellSize.MIN}
            max={CellSize.MAX}
            step={5}
            {...inputHandlers}
          />
        </div>
        <div>
          <label htmlFor="borderWeight">
            Border Weight ({params.borderWeight})
          </label>
          <input
            id="borderWeight"
            type="range"
            name="borderWeight"
            value={params.borderWeight}
            min="1"
            max="10"
            {...inputHandlers}
          />
        </div>
        <div>
          <label htmlFor="gridColumns">
            Grid Columns ({params.gridColumns})
          </label>
          <input
            id="gridColumns"
            type="range"
            name="gridColumns"
            value={params.gridColumns}
            min="2"
            max="25"
            {...inputHandlers}
          />
        </div>
        <div>
          <label htmlFor="gridRows">Grid Rows ({params.gridRows})</label>
          <input
            id="gridRows"
            type="range"
            name="gridRows"
            value={params.gridRows}
            min="2"
            max="25"
            {...inputHandlers}
          />
        </div>
      </Fieldset>
    </Form>
  );
}
