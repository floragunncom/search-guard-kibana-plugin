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

import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import { LicenseWarningCallout } from './LicenseWarningCallout';
import { UiConfigService as ConfigService } from '../../../services/UiConfigService';

describe(LicenseWarningCallout.name, () => {
  let renderer;

  beforeEach(() => {
    renderer = new ShallowRenderer();
  });

  test('license cannot be loaded', () => {
    const configService = new ConfigService({
      config: {
        systeminfo: {},
      },
    });

    const tree = renderer.render(<LicenseWarningCallout configService={configService} />);
    expect(tree).toMatchSnapshot();
  });

  test('license is required', () => {
    const configService = new ConfigService({
      config: {
        systeminfo: {
          sg_license: {
            license_required: true,
          },
        },
      },
    });

    const tree = renderer.render(<LicenseWarningCallout configService={configService} />);
    expect(tree).toMatchSnapshot();
  });

  test('license is not required', () => {
    const configService = new ConfigService({
      config: {
        systeminfo: {
          sg_license: {
            license_required: false,
          },
        },
      },
    });

    const tree = renderer.render(<LicenseWarningCallout configService={configService} />);
    expect(tree).toMatchSnapshot();
  });

  test('community license is valid', () => {
    const configService = new ConfigService({
      config: {
        systeminfo: {
          sg_license: {
            is_valid: true,
            license_required: false,
          },
        },
      },
    });

    const tree = renderer.render(<LicenseWarningCallout configService={configService} />);
    expect(tree).toMatchSnapshot();
  });

  test('trial license is valid but expires in 10 days', () => {
    const configService = new ConfigService({
      config: {
        systeminfo: {
          sg_license: {
            type: 'TRIAL',
            is_valid: true,
            license_required: true,
            expiry_in_days: 10,
          },
        },
      },
    });

    const tree = renderer.render(<LicenseWarningCallout configService={configService} />);
    expect(tree).toMatchSnapshot();
  });

  test('license is valid but expires in 20 days', () => {
    const configService = new ConfigService({
      config: {
        systeminfo: {
          sg_license: {
            is_valid: true,
            license_required: true,
            expiry_in_days: 20,
          },
        },
      },
    });

    const tree = renderer.render(<LicenseWarningCallout configService={configService} />);
    expect(tree).toMatchSnapshot();
  });

  test('license is expired', () => {
    const configService = new ConfigService({
      config: {
        systeminfo: {
          sg_license: {
            license_required: true,
            msgs: ['License is expired'],
          },
        },
      },
    });

    const tree = renderer.render(<LicenseWarningCallout configService={configService} />);
    expect(tree).toMatchSnapshot();
  });
});
