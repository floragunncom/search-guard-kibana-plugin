import { getOperator, buildGraphWatchChecks } from './graphWatch';

describe('graphWatch', () => {
  describe('getOperator', () => {
    test('can create condition operator', () => {
      expect(getOperator('ABOVE')).toBe('>');
      expect(getOperator('BELOW')).toBe('<');
      expect(getOperator('EXACTLY')).toBe('==');
    });
  });

  describe('buildGraphWatchChecks', () => {
    const ui = {
      index: [{ label: 'sg7*' }],
      timeField: '@timestamp',
      aggregationType: 'count',
      fieldName: [],
      overDocuments: 'all documents',
      bucketValue: 1,
      bucketUnitOfTime: 'h',
      thresholdValue: 1000,
      thresholdEnum: 'ABOVE',
      topHitsAgg: { field: [], size: 3, order: 'asc' },
    };

    test('builds a search and a threshold condition when severity is off', () => {
      const checks = buildGraphWatchChecks({ ...ui, isSeverity: false });

      expect(checks).toHaveLength(2);
      expect(checks[0]).toMatchObject({ type: 'search', name: 'mysearch' });
      expect(checks[1]).toEqual({
        type: 'condition',
        name: 'mycondition',
        source: 'data.mysearch.hits.total.value > 1000',
      });
    });

    test('omits the threshold condition when severity is on', () => {
      const checks = buildGraphWatchChecks({ ...ui, isSeverity: true });

      expect(checks).toHaveLength(1);
      expect(checks[0]).toMatchObject({ type: 'search', name: 'mysearch' });
    });
  });
});
