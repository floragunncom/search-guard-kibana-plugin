/**
 *    Copyright 2020 floragunn GmbH

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import { SEVERITY, SEVERITY_ORDER } from '../../../utils/constants';
import { severityThresholdsInvalidAscending, severityThresholdsInvalidDescending } from '../../../../../utils/i18n/watch';

export function validateSeverityThresholds(order, uiThresholds) {
  const thresholdErrors = [];
  const availableLevelsSorted = [
    { order: 10, level: SEVERITY.INFO, threshold: uiThresholds[SEVERITY.INFO] },
    {
      order: 20,
      level: SEVERITY.WARNING,
      threshold: uiThresholds[SEVERITY.WARNING]
    },
    {
      order: 30,
      level: SEVERITY.ERROR,
      threshold: uiThresholds[SEVERITY.ERROR]
    },
    {
      order: 40,
      level: SEVERITY.CRITICAL,
      threshold: uiThresholds[SEVERITY.CRITICAL]
    }
  ].filter(level => typeof level.threshold !== 'undefined');

  const sortedValues = availableLevelsSorted.sort((a, b) => {
    if (order === SEVERITY_ORDER.ASCENDING) {
      return a.threshold - b.threshold;
    } else {
      return b.threshold - a.threshold;
    }
  });

  for (let i = 0; i < sortedValues.length - 1; i++) {
    if (sortedValues[i].threshold === sortedValues[i + 1].threshold
      || sortedValues[i].order > sortedValues[i + 1].order) {
      thresholdErrors.push(sortedValues[i].level);
      thresholdErrors.push(sortedValues[i + 1].level);
    }
  }

  let message = null;
  if (thresholdErrors.length) {
    message = (order === SEVERITY_ORDER.ASCENDING)
      ? severityThresholdsInvalidAscending
      : severityThresholdsInvalidDescending;
  }

  return {
    message,
    thresholdErrors
  };
}