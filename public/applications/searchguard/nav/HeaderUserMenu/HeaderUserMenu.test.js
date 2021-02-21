/*
 *    Copyright 2021 floragunn GmbH
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
import { HeaderUserMenu, LogoutBtn } from './HeaderUserMenu';
import { ConfigService } from '../../../../services';
import { setupKibanaCoreAppServiceMock } from '../../../../utils/mocks';

describe(LogoutBtn.name, () => {
  let renderer;

  beforeEach(() => {
    renderer = new ShallowRenderer();
  });

  test('render the button', () => {
    const tree = renderer.render(<LogoutBtn authType="any" onClick={() => null} />);
    expect(tree).toMatchSnapshot();
  });

  test('do not render the button if Kerberos auth', () => {
    const tree = renderer.render(<LogoutBtn authType="kerberos" onClick={() => null} />);
    expect(tree).toMatchSnapshot();
  });

  test('do not render the button if Proxy auth', () => {
    const tree = renderer.render(<LogoutBtn authType="proxy" onClick={() => null} />);
    expect(tree).toMatchSnapshot();
  });
});

describe(HeaderUserMenu.name, () => {
  let renderer;
  let httpClient;
  let kibanaAppService;

  beforeEach(() => {
    renderer = new ShallowRenderer();
    httpClient = {};
    kibanaAppService = setupKibanaCoreAppServiceMock();
  });

  test('can render the user menu', () => {
    const configService = new ConfigService({
      config: {
        restapiinfo: { user_name: 'a user' },
        searchguard: {
          auth: {
            type: 'basicauth',
            logout_url: '/logout',
          },
          accountinfo: { enabled: true },
          multitenancy: { enabled: true },
        },
      },
    });

    const tree = renderer.render(
      <HeaderUserMenu
        httpClient={httpClient}
        kibanaAppService={kibanaAppService}
        configService={configService}
      />
    );
    expect(tree).toMatchSnapshot();
  });

  test('filter menu items (Multitenancy is disabled)', () => {
    const configService = new ConfigService({
      config: {
        restapiinfo: { user_name: 'a user' },
        searchguard: {
          auth: {
            type: 'basicauth',
            logout_url: '/logout',
          },
          accountinfo: { enabled: true },
          multitenancy: { enabled: false },
        },
      },
    });

    const tree = renderer.render(
      <HeaderUserMenu
        httpClient={httpClient}
        kibanaAppService={kibanaAppService}
        configService={configService}
      />
    );
    expect(tree).toMatchSnapshot();
  });
});
