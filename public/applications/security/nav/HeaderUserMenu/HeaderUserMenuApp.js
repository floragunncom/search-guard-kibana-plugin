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
import ReactDOM from 'react-dom';
import { HeaderUserMenu } from './HeaderUserMenu';

export class HeaderUserMenuApp {
  start({ core, httpClient, configService } = {}) {
    core.chrome.navControls.registerRight({
      order: 5000,
      mount: (element) => {
        ReactDOM.render(
          <HeaderUserMenu httpClient={httpClient} configService={configService} />,
          element
        );
        return () => ReactDOM.unmountComponentAtNode(element);
      },
    });
  }
}
