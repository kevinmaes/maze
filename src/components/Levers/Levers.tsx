import React from 'react';

import { useSelector } from '@xstate/react';
import { AppMachineContext } from '../../statechart/app.machine';
import { GenerationParams } from '../../types';
import { Fieldset, Form, LeverSet } from './Levers.css';

const CellSize = {
  DEFAULT: 20,
  MIN: 10,
  MAX: 25,
};

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

export function Levers() {
  const actorRef = AppMachineContext.useActorRef();
  const { fps, cellSize, borderWeight, gridColumns, gridRows } = useSelector(
    actorRef,
    (state) => state.context.generationParams
  );

  const isEnabled = useSelector(actorRef, (state) =>
    state.hasTag('levers enabled')
  );

  const onLeverChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) =>
    actorRef.send({
      type: 'generation.param.set',
      generationParam: { name, value: parseInt(value, 10) },
    });

  const inputHandlers = { onChange: onLeverChange };

  return (
    <Form
      id="levers"
      onKeyDown={(e) => {
        e.preventDefault();
      }}
    >
      <Fieldset disabled={!isEnabled} data-test-id="levers-fieldset">
        <LeverSet>
          <GenerationParamInputLabel htmlFor="fps">
            FPS ({fps})
          </GenerationParamInputLabel>
          <GenerationParamInput
            id="fps"
            type="range"
            name="fps"
            value={fps}
            min="10"
            max="200"
            step="5"
            {...inputHandlers}
          />
        </LeverSet>
        <LeverSet>
          <GenerationParamInputLabel htmlFor="cellSize">
            Cell Size ({cellSize})
          </GenerationParamInputLabel>
          <GenerationParamInput
            id="cellSize"
            type="range"
            name="cellSize"
            value={cellSize}
            min={CellSize.MIN}
            max={CellSize.MAX}
            step="5"
            {...inputHandlers}
          />
        </LeverSet>
        <LeverSet>
          <GenerationParamInputLabel htmlFor="borderWeight">
            Border Weight ({borderWeight})
          </GenerationParamInputLabel>
          <GenerationParamInput
            id="borderWeight"
            type="range"
            name="borderWeight"
            value={borderWeight}
            min="1"
            max="5"
            {...inputHandlers}
          />
        </LeverSet>
        <LeverSet>
          <GenerationParamInputLabel htmlFor="gridColumns">
            Grid Columns ({gridColumns})
          </GenerationParamInputLabel>
          <GenerationParamInput
            id="gridColumns"
            type="range"
            name="gridColumns"
            value={gridColumns}
            min="5"
            max="25"
            step="5"
            {...inputHandlers}
          />
        </LeverSet>
        <LeverSet>
          <GenerationParamInputLabel htmlFor="gridRows">
            Grid Rows ({gridRows})
          </GenerationParamInputLabel>
          <GenerationParamInput
            id="gridRows"
            type="range"
            name="gridRows"
            value={gridRows}
            min="5"
            max="25"
            step="5"
            {...inputHandlers}
          />
        </LeverSet>
      </Fieldset>
    </Form>
  );
}
