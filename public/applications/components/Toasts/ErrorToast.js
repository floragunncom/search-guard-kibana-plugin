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
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { EuiText, EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';

export function ErrorToast({ error, errorMessage, errorDetails, onDetailsClick }) {
  errorMessage = errorMessage || error.message;
  errorDetails = errorDetails || get(error, 'body', undefined);

  try {
    errorDetails = JSON.stringify(errorDetails, null, 2);
  } catch (e) {
    console.error('addErrorToast', 'Failed to stringify the error details.', e);
    errorDetails = null;
  }

  if (errorDetails) {
    return (
      <div id="sgErrorToast">
        <EuiText size="s">
          <p>{errorMessage}</p>
        </EuiText>
        <EuiSpacer />

        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButton
              color="danger"
              size="s"
              onClick={() => onDetailsClick({ errorMessage, errorDetails })}
            >
              Details
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }

  return <div id="sgErrorToast">{errorMessage}</div>;
}

ErrorToast.propTypes = {
  error: PropTypes.object.isRequired,
  onDetailsClick: PropTypes.func,
  errorMessage: PropTypes.string,
  errorDetails: PropTypes.object,
};
