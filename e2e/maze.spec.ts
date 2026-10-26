import { expect, type Page, test } from '@playwright/test';

async function prepareMaze(page: Page) {
  // Drive timers explicitly so 200 FPS cannot finish before pause is exercised.
  const time = new Date('2026-10-26T12:00:00Z');
  await page.clock.install({ time });
  await page.clock.pauseAt(time);
  await page.goto('/');
  await expect(page.getByText('Press ENTER to start')).toBeVisible();

  for (const [name, value] of [
    ['FPS', '200'],
    ['Grid Columns', '5'],
    ['Grid Rows', '5'],
  ] as const) {
    const slider = page.getByRole('slider', { name: new RegExp(name) });
    // #1663: Levers prevents keyboard defaults, so range keys cannot change values.
    // Use a native input event until that handler is audited.
    await slider.evaluate((element, nextValue) => {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
      )?.set;
      setter?.call(element, nextValue);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
    await expect(slider).toHaveValue(value);
  }
  const canvas = page.locator('canvas');
  await expect(canvas).toHaveAttribute('width', '104');
  await expect(canvas).toHaveAttribute('height', '104');
  return canvas;
}

test('generates a maze, pauses, steps, resumes, and restarts', async ({
  page,
}) => {
  const canvas = await prepareMaze(page);
  const before = await canvas.evaluate((element: HTMLCanvasElement) =>
    element.toDataURL()
  );

  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('button', { name: 'Pause', exact: true })
  ).toBeEnabled();
  await page.keyboard.press('Space');
  const step = page.getByRole('button', { name: 'Step forward', exact: true });
  await expect(step).toBeEnabled();
  await page.clock.runFor(100);
  await expect(step).toBeEnabled();
  await page.keyboard.press('ArrowRight');
  await expect(step).toBeEnabled();
  await page.keyboard.press('Space');
  await expect(step).toBeDisabled();
  await page.clock.runFor(2_000);

  const restart = page.getByRole('button', { name: 'Restart', exact: true });
  await expect(restart).toBeVisible();
  const after = await canvas.evaluate((element: HTMLCanvasElement) =>
    element.toDataURL()
  );
  expect(after).not.toBe(before);
  const blank = await canvas.evaluate((element: HTMLCanvasElement) => {
    const empty = document.createElement('canvas');
    empty.width = element.width;
    empty.height = element.height;
    return empty.toDataURL();
  });
  expect(after).not.toBe(blank);

  await restart.click();
  await expect(page.getByText('Press ENTER to start')).toBeVisible();
  await expect(page.getByRole('slider', { name: /FPS/ })).toBeEnabled();
});

test('stops a paused maze and returns to the start prompt', async ({
  page,
}) => {
  await prepareMaze(page);

  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await expect(
    page.getByRole('button', { name: 'Step forward', exact: true })
  ).toBeEnabled();
  // Give a stopped session a new timestamp so Stage can inject its new grid (#1663).
  await page.clock.runFor(10);
  await page.keyboard.press('Escape');

  await expect(page.getByText('Press ENTER to start')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Play', exact: true })
  ).toBeEnabled();
  await expect(
    page.getByRole('button', { name: 'Stop', exact: true })
  ).toBeDisabled();
});
