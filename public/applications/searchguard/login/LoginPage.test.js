/** @jest-environment jsdom */
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
import { LoginPage } from './LoginPage';
import { ConfigService } from '../../../services';
import { setupApiServiceMock, setupCoreMock, setupCoreContextMock } from '../../../utils/mocks';

describe(LoginPage.name, () => {
  let httpClient;
  let renderer;
  let basePath;
  let systeminfo;
  let uiSettings;
  let coreContext;
  let apiService;

  beforeEach(() => {
    uiSettings = setupCoreMock({
      uiSettingsGet: (setting) => setting !== 'theme:darkMode',
    }).uiSettings;
    apiService = setupApiServiceMock();
    httpClient = () => null;
    renderer = new ShallowRenderer();
    basePath = 'abc';
    systeminfo = {
      sg_license: {
        type: 'TRIAL',
        issue_date: '2021-01-13',
        expiry_date: '2021-03-14',
      },
    };
  });

  test('can render the page with a license and the basicauth login defaults', () => {
    const configGet = jest.fn(() => ({
      basicauth: {
        alternative_login: {
          headers: [],
          show_for_parameter: '',
          valid_redirects: [],
          button_text: 'Login with provider',
          buttonstyle: '',
        },
        login: {
          title: 'Please login to Kibana',
          subtitle:
            'If you have forgotten your username or password, please ask your system administrator',
          showbrandimage: true,
          brandimage: 'plugins/searchguard/assets/searchguard_logo.svg',
          buttonstyle: '',
        },
      },
    }));
    coreContext = setupCoreContextMock({ configGet });

    const configService = new ConfigService({
      uiSettings,
      coreContext,
      apiService,
      config: {
        systeminfo,
      },
    });

    const tree = renderer.render(
      <LoginPage httpClient={httpClient} basePath={basePath} configService={configService} />
    );
    expect(tree).toMatchSnapshot();
  });

  test('can render the page with HTML in login title and subtitle', () => {
    const configGet = jest.fn(() => ({
      basicauth: {
        alternative_login: {
          headers: [],
          show_for_parameter: '',
          valid_redirects: [],
          button_text: 'Login with provider',
          buttonstyle: '',
        },
        login: {
          title: '<h1 style="color:blue;text-align:center;">Login</h1>',
          subtitle:
            '<div style="color:red;background:#ffe5e5;"><ul><li>abc</li><li>def</li></ul></div>',
          showbrandimage: true,
          brandimage: 'plugins/searchguard/assets/my_logo.png',
          buttonstyle: 'background-color:#4CAF50;border:none;color:white;font-size:16px;',
        },
      },
    }));
    coreContext = setupCoreContextMock({ configGet });

    const configService = new ConfigService({
      uiSettings,
      coreContext,
      apiService,
      config: {
        systeminfo,
      },
    });

    const tree = renderer.render(
      <LoginPage httpClient={httpClient} basePath={basePath} configService={configService} />
    );
    expect(tree).toMatchSnapshot();
  });
});
