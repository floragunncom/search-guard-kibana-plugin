/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { matchExponentialThrottleInterval, buildTimePeriod } from './helpers';
import { ADVANCED_TIME_PERIOD_UNIT, SCHEDULE_DEFAULTS } from './constants';

export const buildFormikThrottle = (watch = {}) => {
  if (!watch.throttle_period) {
    return {
      ...watch,
      throttle_period: SCHEDULE_DEFAULTS.period,
    };
  }

  const [advInterval] = matchExponentialThrottleInterval(watch.throttle_period) || [];

  if (advInterval) {
    return {
      ...watch,
      throttle_period: {
        interval: 1,
        advInterval,
        unit: ADVANCED_TIME_PERIOD_UNIT,
      },
    };
  }

  return {
    ...watch,
    throttle_period: buildTimePeriod(watch.throttle_period),
  };
};
