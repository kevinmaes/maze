import { act, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createGrid } from '../../test/fixtures';
import { renderWithAppMachine } from '../../test/renderWithAppMachine';
import { Levers } from './Levers';

describe('Levers', () => {
  it.each([
    ['FPS', 'fps', 200],
    ['Cell Size', 'cellSize', 25],
    ['Border Weight', 'borderWeight', 5],
    ['Grid Columns', 'gridColumns', 5],
    ['Grid Rows', 'gridRows', 5],
  ] as const)(
    'sends a generation parameter event when %s changes',
    (label, name, value) => {
      const { actor } = renderWithAppMachine(<Levers />);
      const send = vi.spyOn(actor, 'send');
      const slider = screen.getByRole('slider', { name: new RegExp(label) });

      // user-event does not support dragging range inputs; dispatch their change event.
      fireEvent.change(slider, { target: { value: String(value) } });

      expect(send).toHaveBeenCalledWith({
        type: 'generation.param.set',
        generationParam: { name, value },
      });
      expect(actor.getSnapshot().context.generationParams[name]).toBe(value);
      expect(
        screen.getByRole('slider', { name: `${label} (${value})` })
      ).toHaveValue(String(value));
      send.mockRestore();
    }
  );

  it('disables its fieldset and sliders while playing and paused', () => {
    const { actor } = renderWithAppMachine(<Levers />);
    const fieldset = screen.getByRole('group');
    expect(fieldset).toBeEnabled();
    act(() => actor.send({ type: 'grid.inject', grid: createGrid() }));
    expect(fieldset).toBeEnabled();

    act(() => actor.send({ type: 'controls.play' }));

    expect(fieldset).toBeDisabled();
    for (const slider of screen.getAllByRole('slider'))
      expect(slider).toBeDisabled();
    act(() => actor.send({ type: 'controls.pause' }));
    expect(fieldset).toBeDisabled();
    act(() => actor.send({ type: 'controls.stop' }));
    expect(fieldset).toBeEnabled();
  });
});
