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

import { buildThrottle } from './buildThrottle';
import { ADVANCED_TIME_PERIOD_UNIT } from './constants';

describe('buildThrottle', () => {
  test('can create throttle period', () => {
    const formik = {
      throttle_period: {
        interval: 2,
        advInterval: '2m**2|200m',
        unit: 'm',
      },
    };

    const watch = {
      throttle_period: '2m',
    };

    expect(buildThrottle(formik)).toEqual(watch);
  });

  test('can create exponential throttle period', () => {
    const formik = {
      throttle_period: {
        interval: 2,
        advInterval: '2m**2',
        unit: ADVANCED_TIME_PERIOD_UNIT,
      },
    };

    const watch = {
      throttle_period: '2m**2',
    };

    expect(buildThrottle(formik)).toEqual(watch);
  });

  test('can create exponential throttle period with cap', () => {
    const formik = {
      throttle_period: {
        interval: 2,
        advInterval: '2m**2|1d',
        unit: ADVANCED_TIME_PERIOD_UNIT,
      },
    };

    const watch = {
      throttle_period: '2m**2|1d',
    };

    expect(buildThrottle(formik)).toEqual(watch);
  });
});
