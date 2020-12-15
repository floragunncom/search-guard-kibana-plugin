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
import {
  EuiCodeBlock,
  EuiButton,
  EuiSpacer,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiCallOut,
} from '@elastic/eui';
import { cancelText } from '../../../utils/i18n/common';

export function errorToastDetails({ title, errorMessage, errorDetails, onCancel }) {
  return (
    <EuiOverlayMask onClick={onCancel}>
      <EuiModal onClose={onCancel}>
        <EuiModalHeader>
          <EuiModalHeaderTitle>{title}</EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiCallOut color="danger" iconType="alert" title={errorMessage} />
          <EuiSpacer />
          <EuiCodeBlock language="json">{errorDetails}</EuiCodeBlock>
        </EuiModalBody>
        <EuiModalFooter>
          <EuiButton onClick={onCancel} fill>
            {cancelText}
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
}

errorToastDetails.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onCancel: PropTypes.func.isRequired,
  errorMessage: PropTypes.string.isRequired,
  errorDetails: PropTypes.string.isRequired,
};
