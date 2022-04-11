import React, { useEffect } from 'react';

interface Props {
  eventEmitter: any;
  handlers: Record<string, (event: KeyboardEvent) => void>;
  state: string;
}

export const Keyboard = ({ eventEmitter, handlers, state }: Props) => {
  useEffect(() => {
    const eventNames = Object.keys(handlers);

    eventNames.forEach((eventName) =>
      eventEmitter.addEventListener(eventName, handlers[eventName])
    );

    return () =>
      eventNames.forEach((eventName) =>
        eventEmitter.removeEventListener(eventName, handlers[eventName])
      );
  }, [state]);
  return null;
};
