import { niceCeiling } from './column-chart';

describe('niceCeiling', () => {
  it.each([
    [0, 0],
    [7, 10],
    [12, 20],
    [480, 500],
    [1200, 2000],
    [1979.1, 2000],
    [5000, 5000],
  ])('arredonda %d para %d', (valor, esperado) => {
    expect(niceCeiling(valor)).toBe(esperado);
  });
});
