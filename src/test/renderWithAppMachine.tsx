import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { type ActorRefFrom, SimulatedClock } from 'xstate';
import { AppMachineContext, type appMachine } from '../statechart/app.machine';

export function renderWithAppMachine(ui: ReactNode) {
  const clock = new SimulatedClock();
  let actor: ActorRefFrom<typeof appMachine> | undefined;

  function CaptureActor() {
    actor = AppMachineContext.useActorRef();
    return null;
  }

  const view = render(
    <AppMachineContext.Provider options={{ clock }}>
      <CaptureActor />
      {ui}
    </AppMachineContext.Provider>
  );
  if (!actor) throw new Error('App actor was not rendered');

  return { ...view, actor, clock, user: userEvent.setup() };
}
