import React from 'react';

export const useAnimationFrame = (callback: Function) => {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = React.useRef<number | null>(null);
  const previousTimeRef = React.useRef<number | null>(null);

  const animate = (time: number) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime: number = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef && requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []); // Make sure the effect runs only once
};
