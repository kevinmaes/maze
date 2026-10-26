import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithAppMachine } from '../../test/renderWithAppMachine';
import { Audio } from './Audio';

describe('Audio', () => {
  it('starts muted, enables volume when unmuted, and preserves volume across toggles', async () => {
    const { user } = renderWithAppMachine(<Audio />);
    const mute = screen.getByRole('button', { name: 'Mute/Unmute' });
    // #1665: the volume label is not linked to its input yet.
    const volume = screen.getByTestId('audio-volume');
    expect(volume).toBeDisabled();
    expect(volume).toHaveValue('0.5');

    await user.click(mute);
    expect(volume).toBeEnabled();
    fireEvent.change(volume, { target: { value: '0.8' } });
    expect(volume).toHaveValue('0.8');
    await user.click(mute);
    expect(volume).toBeDisabled();
    await user.click(mute);
    expect(volume).toBeEnabled();
    expect(volume).toHaveValue('0.8');
  });

  it('toggles between scale and arpeggio', async () => {
    const { user } = renderWithAppMachine(<Audio />);

    await user.click(screen.getByRole('button', { name: 'Scale' }));

    expect(
      screen.getByRole('button', { name: 'Arpeggio' })
    ).toBeInTheDocument();
  });
});
