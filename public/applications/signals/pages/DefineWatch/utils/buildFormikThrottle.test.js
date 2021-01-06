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

import { buildFormikThrottle } from './buildFormikThrottle';
import { SCHEDULE_DEFAULTS, ADVANCED_TIME_PERIOD_UNIT } from './constants';

describe('buildFormikThrottle', () => {
  test('can create throttle formik period if no throttle period', () => {
    const watch = {};

    const formik = {
      throttle_period: SCHEDULE_DEFAULTS.period,
    };

    expect(buildFormikThrottle(watch)).toEqual(formik);
  });

  test('can create throttle formik period from throttle period', () => {
    const watch = {
      throttle_period: '2m',
    };

    const formik = {
      throttle_period: {
        interval: 2,
        advInterval: SCHEDULE_DEFAULTS.period.advInterval,
        unit: 'm',
      },
    };

    expect(buildFormikThrottle(watch)).toEqual(formik);
  });

  test('can create exponential throttle formik period', () => {
    const watch = {
      throttle_period: '2m**2',
    };

    const formik = {
      throttle_period: {
        interval: 1,
        advInterval: '2m**2',
        unit: ADVANCED_TIME_PERIOD_UNIT,
      },
    };

    expect(buildFormikThrottle(watch)).toEqual(formik);
  });

  test('can create exponential throttle formik period with cap', () => {
    const watch = {
      throttle_period: '2m**2|24h',
    };

    const formik = {
      throttle_period: {
        interval: 1,
        advInterval: '2m**2|24h',
        unit: ADVANCED_TIME_PERIOD_UNIT,
      },
    };

    expect(buildFormikThrottle(watch)).toEqual(formik);
  });
});
