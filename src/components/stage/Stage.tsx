import React, { useRef, useEffect } from 'react';

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
    }
  }, []);

  const dw = Math.floor(pixelRatio * width);
  const dh = Math.floor(pixelRatio * height);
  const style = { width, height, border: '4px solid red' };

  return <canvas ref={canvas} width={dw} height={dh} style={style} />;
};

export default Stage;
