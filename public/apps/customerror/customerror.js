/* eslint-disable @kbn/eslint/require-license-header */
/**
 *    Copyright 2019 floragunn GmbH

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

import chrome from 'ui/chrome';
import React from 'react';
import { camelCase } from 'lodash';
import { render } from 'react-dom';
import { CustomErrorPage } from './CustomErrorPage';

const PAGEID = 'customerror';

// TODO: Deprecate the reducer below when basicauth.login.buttonstyle is object with valid React CSS style props
function legacyCSSToReactStyle(style = '') {
  return style.split(';').reduce((acc, style) => {
    const [, key, value] = style.match(/(.+):(.+)/) || [];
    if (key) {
      acc[camelCase(key.trim())] = value.trim();
    }
    return acc;
  }, {});
}

chrome
  .setVisible(false)
  .setRootTemplate(`<div id="${PAGEID}" />`)
  .setRootController(PAGEID, $scope => {
    $scope.$$postDigest(() => {
      const basePath = chrome.getBasePath();

      // Custom styling
      const brandImagePath = chrome.getInjected('basicauth.login.brandimage');
      const showBrandImage = chrome.getInjected('basicauth.login.showbrandimage');

      const backButtonContentPropsStyle = legacyCSSToReactStyle(
        chrome.getInjected('basicauth.login.buttonstyle')
      );

      render(
        <CustomErrorPage
          basePath={basePath}
          brandImagePath={brandImagePath}
          showBrandImage={showBrandImage}
          backButtonContentPropsStyle={backButtonContentPropsStyle}
        />,
        document.getElementById(PAGEID)
      );
    });
  });
