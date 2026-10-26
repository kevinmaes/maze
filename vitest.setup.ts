import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = vi.fn(
  () =>
    ({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: [] })),
      putImageData: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      closePath: vi.fn(),
    }) as unknown as CanvasRenderingContext2D
) as unknown as HTMLCanvasElement['getContext'];

// Mock use-sound library
vi.mock('use-sound', () => ({
  default: () => [vi.fn(), { sound: { play: vi.fn() } }],
}));
