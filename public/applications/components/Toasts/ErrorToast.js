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

  // This is mostly (only?) for Signals
  const errorItems = [];
  const detailedErrorMessage = get(error || {}, 'body.attributes.body.detail', null);

  if (detailedErrorMessage) {
    /*
    // Example of an error message's body:
    {
      "statusCode": 400,
      "error": "Bad Request",
      "message": "{\"status\":400,\"error\":\"Watch is invalid: 'severity.mapping': The ordering of the thresholds is not consistent to the ordering of the levels: 400 > 500 but critical > info\",\"detail\":{\"severity.mapping\":[{\"error\":\"The ordering of the thresholds is not consistent to the ordering of the levels: 400 > 500 but critical > info\"}]}}",
      "attributes": {
        "body": {
          "status": 400,
          "error": "Watch is invalid: 'severity.mapping': The ordering of the thresholds is not consistent to the ordering of the levels: 400 > 500 but critical > info",
          "detail": {
            "severity.mapping": [
              {
                "error": "The ordering of the thresholds is not consistent to the ordering of the levels: 400 > 500 but critical > info"
              }
            ]
          }
        }
      }
    */
    try {
      // Build a list with the individual error messages
      Object.values(detailedErrorMessage).forEach((field) => {
        field
          .filter((field) => {
            // Just in case the error property is missing
            return field.error;
          })
          .map((field) => {
            errorItems.push(field.error);
          });
      });
    } catch (error) {
      console.warn('Could not collect error messages', error);
    }
  }

  if (errorDetails) {
    return (
      <div id="sgErrorToast">
        {/* Remove "Bad Request" etc if we have detailed error items */}
        {errorItems.length === 0 && (
          <EuiText size="s">
            <p>{errorMessage}</p>
          </EuiText>
        )}
        <EuiSpacer />
        {errorItems.length > 0 && (
          <ul>
            {errorItems.map((errorItem) => {
              return (
                <li>
                  {errorItem}
                </li>
              )
            })}
          </ul>
        )}
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
