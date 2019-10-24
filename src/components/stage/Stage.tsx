import React, { useRef, useEffect } from 'react';

import { useAnimationFrame } from '../hooks/useAnimationFrame';

interface Props {
  width?: number;
  height?: number;
  pixelRatio?: number;
}

interface Canvas {
  current?: {
    getContext?: Function;
  };
}

interface RequestRef {
  current: Number | undefined;
}

let count = 0;

const Stage = (props: Props) => {
  // Declare a new state variable, which we'll call "count"
  const {
    width = 100,
    height = 100,
    pixelRatio = window.devicePixelRatio,
  } = props;

  const canvas: any = useRef(null);

  useEffect(() => {
    if (canvas && canvas.current) {
      const context = canvas.current.getContext('2d');

      context.save();
      context.scale(pixelRatio, pixelRatio);
      context.fillStyle = 'hsl(0, 0%, 95%)';
      context.fillRect(0, 0, width, height);

      context.strokeStyle = 'black';
      context.beginPath();
      context.arc(width / 2, height / 2, width / 4, 0, Math.PI * 2);
      context.stroke();
      context.restore();

      // createGrid(GRID_ROWS * GRID_COLUMNS, CELL_SIZE);
    }
  }, []);

  useAnimationFrame({ fps: 5 }, (deltaTime: number) => {
    // console.log({ deltaTime });

    if (canvas && canvas.current) {
      const context = canvas.current.getContext('2d');

      context.save();
      context.fillStyle = 'hsl(0, 0%, 95%)';

      context.strokeStyle = 'blue';
      context.beginPath();
      context.arc(
        (Math.random() * width) / 2,
        (Math.random() * height) / 2,
        width / 4,
        0,
        Math.PI * 2
      );
      context.stroke();
      context.restore();
    }

    count += 1;
  });

  const dw = Math.floor(pixelRatio * width);
  const dh = Math.floor(pixelRatio * height);
  const style = { width, height, border: '4px solid red' };

  return <canvas ref={canvas} width={dw} height={dh} style={style} />;
};

export default Stage;
