/* eslint-disable @kbn/eslint/require-license-header */
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
import React from 'react';
import PropTypes from 'prop-types';
import {
  EuiPanel,
  EuiText,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiImage,
  EuiErrorBoundary,
} from '@elastic/eui';
import { messageTypes } from './errorMessageTypes';

export function CustomErrorPage({
  basePath = '',
  brandImagePath = '',
  showBrandImage = false,
  backButtonStyle = {},
}) {
  const buttonHref = basePath + '/app/kibana';

  // If session was not terminated by logout, clear any remaining
  // stored paths etc. from previous users, to avoid issues
  // like a non-working default index pattern
  localStorage.clear();
  sessionStorage.clear();

  let type = null;

  // Strip the first ? from the query parameters, if we have any
  const queryString = window.location.search.trim().replace(/^(\?)/, '');

  if (queryString) {
    queryString.split('&').map((parameter) => {
      const parameterParts = parameter.split('=');
      if (parameterParts[0].toLowerCase() === 'type') {
        type = parameterParts[1];
      }
    });
  }

  let { title, subtitle: subTitle } = messageTypes.default;
  if (messageTypes[type]) {
    title = messageTypes[type].title;
    subTitle = messageTypes[type].subtitle;
  }

  return (
    <EuiErrorBoundary>
      <EuiSpacer size="xxl" />
      <EuiFlexGroup justifyContent="spaceAround">
        <EuiFlexItem grow={false}>
          <EuiPanel>
            <div style={{ margin: 'auto', maxWidth: '300px' }}>
              {showBrandImage && (
                <EuiImage
                  data-test-subj="sg.customError.brandImage"
                  alt="Brand image"
                  size="l"
                  url={
                    brandImagePath.startsWith('/plugins')
                      ? basePath + brandImagePath
                      : brandImagePath
                  }
                />
              )}
            </div>
            <EuiText textAlign="center" data-test-subj="sg.customError.title">
              <h2>{title}</h2>
            </EuiText>
            <EuiText textAlign="center" data-test-subj="sg.customError.subTitle">
              <p>{subTitle}</p>
            </EuiText>
            <EuiFlexGroup justifyContent="spaceAround">
              <EuiFlexItem>
                <EuiButton
                  fill
                  href={buttonHref}
                  data-test-subj="sg.customError.btn"
                  id="sg.custom.home"
                  style={backButtonStyle}
                >
                  Back to Kibana Home
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiErrorBoundary>
  );
}

CustomErrorPage.propTypes = {
  brandImagePath: PropTypes.string.isRequired,
  showBrandImage: PropTypes.bool.isRequired,
  backButtonStyle: PropTypes.object.isRequired,
};
