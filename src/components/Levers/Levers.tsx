import React from 'react';

import { Form, Fieldset } from './Levers.css';
import {
  GenerationParamsId,
  GenerationParams,
} from '../../statechart/appMachineTypes';

const CellSize = {
  DEFAULT: 20,
  MIN: 10,
  MAX: 25,
};

interface Props {
  enabled: boolean;
  params: GenerationParams;
  updateFromLevers: (data: { name: string; value: number }) => void;
  settingsAreChanging: (value: boolean) => void;
}

export const Levers = ({
  enabled,
  params,
  updateFromLevers,
  settingsAreChanging,
}: Props) => {
  const onLeverChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) =>
    updateFromLevers({ name, value: parseInt(value, 10) });

  const inputHandlers = {
    onMouseDown: () => settingsAreChanging(true),
    onMouseUp: () => settingsAreChanging(false),
    onPointerDown: () => settingsAreChanging(true),
    onPointerUp: () => settingsAreChanging(false),
    onChange: onLeverChange,
  };

  return (
    <Form>
      <Fieldset disabled={!enabled}>
        <div>
          <label>FPS ({params.fps})</label>
          <input
            type="range"
            name={GenerationParamsId.FPS}
            value={params.fps}
            min="1"
            max="60"
            step={1}
            {...inputHandlers}
          />
        </div>
        <div>
          <label>Cell Size ({params.cellSize})</label>
          <input
            type="range"
            name={GenerationParamsId.CELL_SIZE}
            value={params.cellSize}
            min={CellSize.MIN}
            max={CellSize.MAX}
            step={5}
            {...inputHandlers}
          />
        </div>
        <div>
          <label>Border Weight ({params.borderWeight})</label>
          <input
            type="range"
            name={GenerationParamsId.BORDER_WEIGHT}
            value={params.borderWeight}
            min="1"
            max="10"
            {...inputHandlers}
          />
        </div>
        <div>
          <label>Grid Columns ({params.gridColumns})</label>
          <input
            type="range"
            name={GenerationParamsId.GRID_COLUMNS}
            value={params.gridColumns}
            min="2"
            max="25"
            {...inputHandlers}
          />
        </div>
        <div>
          <label>Grid Rows ({params.gridRows})</label>
          <input
            type="range"
            name={GenerationParamsId.GRID_ROWS}
            value={params.gridRows}
            min="2"
            max="25"
            {...inputHandlers}
          />
        </div>
      </Fieldset>
    </Form>
  );
};
