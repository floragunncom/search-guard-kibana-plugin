/* eslint-disable @osd/eslint/require-license-header */
import { stringCSSToReactStyle } from './cssHelper';

describe('stringCSSToReactStyle', () => {
  test('Convert inline style to React style', () => {
    const style = 'color:blue;text-align:center;';
    const result = {
      color: 'blue',
      textAlign: 'center',
    };

    expect(stringCSSToReactStyle(style)).toEqual(result);
  });
});
