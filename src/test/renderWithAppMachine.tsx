import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { type ActorRefFrom, SimulatedClock } from 'xstate';
import { AppMachineContext, type appMachine } from '../statechart/app.machine';

function CaptureActor({
  capture,
}: {
  capture: (actor: ActorRefFrom<typeof appMachine>) => void;
}) {
  capture(AppMachineContext.useActorRef());
  return null;
}

export function renderWithAppMachine(ui: ReactNode) {
  const clock = new SimulatedClock();
  let actor: ActorRefFrom<typeof appMachine> | undefined;

  const view = render(
    <AppMachineContext.Provider options={{ clock }}>
      <CaptureActor capture={(value) => (actor = value)} />
      {ui}
    </AppMachineContext.Provider>
  );
  if (!actor) throw new Error('App actor was not rendered');

  return { ...view, actor, clock, user: userEvent.setup() };
}
