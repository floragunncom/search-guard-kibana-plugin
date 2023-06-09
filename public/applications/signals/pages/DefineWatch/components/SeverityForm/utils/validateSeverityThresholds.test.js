/* eslint-disable @kbn/eslint/require-license-header */
import { SEVERITY, SEVERITY_ORDER } from '../../../utils/constants';
import { validateSeverityThresholds } from './validateSeverityThresholds';

describe('severity Validation', () => {
  test('fail validation on wrong ascending order', () => {
    const order = SEVERITY_ORDER.ASCENDING;
    const thresholds = {
      [SEVERITY.INFO]: 100,
      [SEVERITY.WARNING]: 200,
      [SEVERITY.CRITICAL]: 100,
    };

    const validationResult = validateSeverityThresholds(order, thresholds);

    expect(validationResult.thresholdErrors).toContain(SEVERITY.CRITICAL);
  });

  test('fail on duplicate values', () => {
    const order = SEVERITY_ORDER.DESCENDING;
    const thresholds = {
      [SEVERITY.INFO]: 200,
      [SEVERITY.WARNING]: 200,
      [SEVERITY.CRITICAL]: 100,
    };

    const validationResult = validateSeverityThresholds(order, thresholds);

    expect(validationResult.thresholdErrors).toContain(SEVERITY.INFO);
  });

  test('correct values ascending order', () => {
    const order = SEVERITY_ORDER.ASCENDING;
    const thresholds = {
      [SEVERITY.INFO]: 100,
      [SEVERITY.WARNING]: 200,
      [SEVERITY.CRITICAL]: 300,
    };

    const validationResult = validateSeverityThresholds(order, thresholds);

    expect(validationResult.thresholdErrors).toHaveLength(0);
  });

  test('correct values descending order', () => {
    const order = SEVERITY_ORDER.DESCENDING;
    const thresholds = {
      [SEVERITY.INFO]: 300,
      [SEVERITY.WARNING]: 200,
      [SEVERITY.CRITICAL]: 100,
    };

    const validationResult = validateSeverityThresholds(order, thresholds);

    expect(validationResult.thresholdErrors).toHaveLength(0);
  });

  test('can omit thresholds', () => {
    const order = SEVERITY_ORDER.ASCENDING;
    const thresholds = {
      [SEVERITY.INFO]: 0, // placeholder value
      [SEVERITY.WARNING]: 200,
      [SEVERITY.ERROR]: undefined, // legacy placeholder value
      [SEVERITY.CRITICAL]: 400,
    };

    const validationResult = validateSeverityThresholds(order, thresholds);

    expect(validationResult.thresholdErrors).toHaveLength(0);
  });
});
