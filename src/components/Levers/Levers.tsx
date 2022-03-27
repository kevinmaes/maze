// TODO: Move these files.
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
  updateFromLevers: Function;
}

export const Levers = ({ enabled, params, updateFromLevers }: Props) => {
  const onLeverChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) =>
    updateFromLevers({ name, value: parseInt(value, 10) });
  return (
    <Form>
      <Fieldset disabled={!enabled}>
        <div>
          <label>FPS ({params.fps})</label>
          <input
            type="range"
            name={GenerationParamsId.FPS}
            value={params.fps}
            min="5"
            max="60"
            step={5}
            onChange={onLeverChange}
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
            onChange={onLeverChange}
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
            onChange={onLeverChange}
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
            onChange={onLeverChange}
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
            onChange={onLeverChange}
          />
        </div>
      </Fieldset>
    </Form>
  );
};
