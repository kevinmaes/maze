import { useEffect } from 'react';

interface EventEmitter {
  addEventListener: (
    eventName: string,
    handler: (event: KeyboardEvent) => void
  ) => void;
  removeEventListener: (
    eventName: string,
    handler: (event: KeyboardEvent) => void
  ) => void;
}

interface Props {
  eventEmitter: EventEmitter;
  handlers: Record<string, (event: KeyboardEvent) => void>;
  state: string;
}

export function Keyboard({ eventEmitter, handlers, state }: Props) {
  useEffect(() => {
    const eventNames = Object.keys(handlers);

    eventNames.forEach((eventName) =>
      eventEmitter.addEventListener(eventName, handlers[eventName])
    );

    return () =>
      eventNames.forEach((eventName) =>
        eventEmitter.removeEventListener(eventName, handlers[eventName])
      );
  }, [state, eventEmitter, handlers]);
  return null;
}
