import { useTypesafeActions } from '../../hooks/useTypesafeActions';
// TODO: Move these files.
import { AppState } from '../App/types';
import { Actions, reducer } from '../App/reducer';
import { Form, Fieldset } from './Levers.css';

const FPS_DEFAULT = 30;
const BORDER_WEIGHT_DEFAULT = 2;
const GRID_SIZE_DEFAULT = 15;

const CellSize = {
  DEFAULT: 20,
  MIN: 10,
  MAX: 25,
};

const initialState: AppState = {
  fps: FPS_DEFAULT,
  cellSize: CellSize.DEFAULT,
  borderWeight: BORDER_WEIGHT_DEFAULT,
  gridColumns: GRID_SIZE_DEFAULT,
  gridRows: GRID_SIZE_DEFAULT,
};

interface Props {
  enabled: boolean;
  updateFromLevers: Function;
}

export const Levers = ({ enabled, updateFromLevers }: Props) => {
  const [state, actions] = useTypesafeActions<AppState, typeof Actions>(
    reducer,
    initialState,
    Actions
  );

  return (
    <Form>
      <Fieldset disabled={!enabled}>
        <div>
          <label>FPS ({state.fps})</label>
          <input
            type="range"
            name="fps"
            value={state.fps}
            min="5"
            max="60"
            step={5}
            onChange={({ target: { value } }) => {
              actions.setFPS(parseInt(value, 10));
            }}
          />
        </div>
        <div>
          <label>Cell Size ({state.cellSize})</label>
          <input
            type="range"
            name="cellSize"
            value={state.cellSize}
            min={CellSize.MIN}
            max={CellSize.MAX}
            step={5}
            onChange={({ target: { value } }) =>
              actions.setCellSize(parseInt(value, 10))
            }
          />
        </div>
        <div>
          <label>Border Weight ({state.borderWeight})</label>
          <input
            type="range"
            name="borderWeight"
            value={state.borderWeight}
            min="1"
            max="10"
            onChange={({ target: { value } }) =>
              actions.setBorderWeight(parseInt(value, 10))
            }
          />
        </div>
        <div>
          <label>Grid Columns ({state.gridColumns})</label>
          <input
            type="range"
            name="gridColumns"
            value={state.gridColumns}
            min="2"
            max="25"
            onChange={({ target: { value } }) =>
              actions.setGridColumns(parseInt(value, 10))
            }
          />
        </div>
        <div>
          <label>Grid Rows ({state.gridRows})</label>
          <input
            type="range"
            name="gridRows"
            value={state.gridRows}
            min="2"
            max="25"
            onChange={({ target: { value } }) =>
              actions.setGridRows(parseInt(value, 10))
            }
          />
        </div>
      </Fieldset>
    </Form>
  );
};
