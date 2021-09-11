/* eslint-disable @osd/eslint/require-license-header */
import { stringifyPretty } from '../../../../../utils/helpers';
import { get } from 'lodash';

export function getChecksExecutionResponse(formikValues = {}, checksResult = '') {
  let results;

  if (checksResult) {
    try {
      results = JSON.parse(checksResult);
    } catch (err) {
      console.error('getChecksExecutionResponse -- parse checks result', err);
      results = {};
    }
  } else {
    results = get(formikValues, '_ui.checksResult', {});
  }

  return results && results.runtime_attributes
    ? stringifyPretty(results.runtime_attributes)
    : stringifyPretty(results);
}
