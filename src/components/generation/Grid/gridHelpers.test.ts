import { describe, expect, it } from 'vitest';
import { getColumnIndex, getIndex, getRowIndex } from './gridHelpers';

describe('grid coordinates', () => {
  it.each([1, 3, 5])(
    'round trips every index in a %i-column grid',
    (columns) => {
      const indices = Array.from({ length: columns * 4 }, (_, index) => index);

      const coordinates = indices.map((index) => ({
        row: getRowIndex(index, columns),
        column: getColumnIndex(index, columns),
      }));

      expect(
        coordinates.map(({ row, column }) => getIndex(row, column, columns))
      ).toEqual(indices);
      expect(coordinates[0]).toEqual({ row: 0, column: 0 });
      expect(coordinates.at(-1)).toEqual({ row: 3, column: columns - 1 });
    }
  );

  it('maps row and column to a row-major index', () => {
    const columns = 5;

    const index = getIndex(2, 3, columns);

    expect(index).toBe(13);
    expect(getRowIndex(index, columns)).toBe(2);
    expect(getColumnIndex(index, columns)).toBe(3);
  });
});
