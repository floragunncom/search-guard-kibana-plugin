import { getOperator } from './graphWatch';

describe('graphWatch', () => {
  describe('getOperator', () => {
    test('can create condition operator', () => {
      expect(getOperator('ABOVE')).toBe('>');
      expect(getOperator('BELOW')).toBe('<');
      expect(getOperator('EXACTLY')).toBe('==');
    });
  });
});
