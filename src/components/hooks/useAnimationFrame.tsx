import React from 'react';

type UseAnimationFrame = (options: { fps: number }, callback: Function) => void;

export const useAnimationFrame: UseAnimationFrame = ({ fps }, callback) => {
  const fpsInterval = 1000 / fps;

  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = React.useRef<number | null>(null);
  const previousTimeRef = React.useRef<number | null>(null);

  const animate = (time: number) => {
    if (previousTimeRef.current) {
      const elapsed = time - previousTimeRef.current;

      const deltaTime: number = time - previousTimeRef.current;
      if (elapsed > fpsInterval) {
        callback(deltaTime);
        previousTimeRef.current = time;
      } else {
        previousTimeRef.current = time - elapsed;
      }
    } else {
      previousTimeRef.current = time;
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef && requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [fps]); // Make sure the effect runs only once
};
