import React from 'react';

import { Fieldset, Form, LeverSet } from './Levers.css';
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

interface InputLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor: keyof GenerationParams;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: keyof GenerationParams;
  name: keyof GenerationParams;
}

function GenerationParamInputLabel(props: InputLabelProps) {
  return <label {...props} />;
}

function GenerationParamInput(props: InputProps) {
  return <input {...props} />;
}

export function Levers({ enabled, params, updateFromLevers }: Props) {
  const onLeverChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) =>
    updateFromLevers({ name, value: parseInt(value, 10) });

  const inputHandlers = { onChange: onLeverChange };

  return (
    <Form
      id="levers"
      onKeyDown={(e) => {
        e.preventDefault();
      }}
    >
      <Fieldset disabled={!enabled} data-test-id="levers-fieldset">
        <LeverSet>
          <GenerationParamInputLabel htmlFor="fps">
            FPS ({params.fps})
          </GenerationParamInputLabel>
          <GenerationParamInput
            id="fps"
            type="range"
            name="fps"
            value={params.fps}
            min="5"
            max="60"
            step={5}
            {...inputHandlers}
          />
        </LeverSet>
        <LeverSet>
          <GenerationParamInputLabel htmlFor="cellSize">
            Cell Size ({params.cellSize})
          </GenerationParamInputLabel>
          <GenerationParamInput
            id="cellSize"
            type="range"
            name="cellSize"
            value={params.cellSize}
            min={CellSize.MIN}
            max={CellSize.MAX}
            step={5}
            {...inputHandlers}
          />
        </LeverSet>
        <LeverSet>
          <GenerationParamInputLabel htmlFor="borderWeight">
            Border Weight ({params.borderWeight})
          </GenerationParamInputLabel>
          <GenerationParamInput
            id="borderWeight"
            type="range"
            name="borderWeight"
            value={params.borderWeight}
            min="1"
            max="5"
            {...inputHandlers}
          />
        </LeverSet>
        <LeverSet>
          <GenerationParamInputLabel htmlFor="gridColumns">
            Grid Columns ({params.gridColumns})
          </GenerationParamInputLabel>
          <GenerationParamInput
            id="gridColumns"
            type="range"
            name="gridColumns"
            value={params.gridColumns}
            min="2"
            max="25"
            {...inputHandlers}
          />
        </LeverSet>
        <LeverSet>
          <GenerationParamInputLabel htmlFor="gridRows">
            Grid Rows ({params.gridRows})
          </GenerationParamInputLabel>
          <GenerationParamInput
            id="gridRows"
            type="range"
            name="gridRows"
            value={params.gridRows}
            min="2"
            max="25"
            {...inputHandlers}
          />
        </LeverSet>
      </Fieldset>
    </Form>
  );
}
