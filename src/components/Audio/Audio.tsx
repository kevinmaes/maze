import useSound from 'use-sound';

interface Props {
  columnIndex: number;
  maxColumnIndex: number;
  maxRowIndex: number;
  rowIndex: number;
}

export const Audio = ({
  columnIndex,
  maxColumnIndex,
  maxRowIndex,
  rowIndex,
}: Props) => {
  const prevColumnIndex = 0;
  const prevRowIndex = 0;
  const newColumnIndex = 1;
  const newRowIndex = 0;

  // Whichever index has changed, column or row, positive or negative.
  const increment: number =
    newColumnIndex - prevColumnIndex || newRowIndex - prevRowIndex;

  const c5Hz: number = 523.3;
  const multiplier = 1.059463094359;

  const frequency = c5Hz * Math.pow(multiplier, increment);

  console.log({ frequency });

  const playbackRate = frequency / c5Hz;
  console.log({ playbackRate });

  const [play] = useSound('/sounds/marimba-c5.wav', {
    playbackRate,
  });
  console.log('Audio render');

  // play();
  return <button onClick={play}>Play sound</button>;
};
