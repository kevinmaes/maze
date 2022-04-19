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
  const columnRange = maxColumnIndex;
  const stepIncrement = 1 / columnRange;

  console.log({ columnRange });

  const playbackRate = 1 + columnIndex * stepIncrement;
  console.log({ playbackRate });

  const [play] = useSound('/sounds/marimba-c5.wav', {
    playbackRate,
  });
  console.log('Audio render');

  play();
  return (
    <>
      <button onClick={() => play()}>Play sound</button>
    </>
  );
};
