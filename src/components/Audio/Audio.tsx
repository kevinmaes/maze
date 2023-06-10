import useSound from 'use-sound';

interface Props {
  columnIndex: number;
  maxColumnIndex?: number;
  maxRowIndex?: number;
  rowIndex?: number;
}

export const Audio = ({ columnIndex }: Props) => {
  let prevColumnIndex = 0;

  const increment: number = columnIndex - prevColumnIndex;

  prevColumnIndex = columnIndex;

  const c5Hz = 523.3;
  const multiplier = 1.059463094359;

  const frequency = c5Hz * Math.pow(multiplier, increment);

  const playbackRate = frequency / c5Hz;

  const [play] = useSound('/sounds/marimba-c5.wav', {
    playbackRate,
  });

  play();
  return null;
};
