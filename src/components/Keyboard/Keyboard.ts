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
    const entries = Object.entries(handlers);

    entries.forEach(([eventName, handler]) =>
      eventEmitter.addEventListener(eventName, handler)
    );

    return () =>
      entries.forEach(([eventName, handler]) =>
        eventEmitter.removeEventListener(eventName, handler)
      );
  }, [state, eventEmitter, handlers]);
  return null;
}
