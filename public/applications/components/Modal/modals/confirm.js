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
import { EuiOverlayMask, EuiConfirmModal, EuiText, EUI_MODAL_CONFIRM_BUTTON } from '@elastic/eui';
import { cancelText, confirmText } from '../../../utils/i18n/common';

export function confirm({
  title = confirmText,
  modalProps = {
    buttonColor: 'danger',
    defaultFocusedButton: EUI_MODAL_CONFIRM_BUTTON,
  },
  body = null,
  onConfirm,
  onCancel,
  cancelButtonText = cancelText,
  confirmButtonText = confirmText,
} = {}) {
  return (
    <EuiOverlayMask>
      <EuiConfirmModal
        id="confirm-modal"
        className="sgConfirmModal"
        title={title}
        onCancel={onCancel}
        onConfirm={onConfirm}
        cancelButtonText={cancelButtonText}
        confirmButtonText={confirmButtonText}
        {...modalProps}
      >
        <EuiText className="sgConfirmModalBody" data-test-subj="sgConfirmModalBody">
          {body}
        </EuiText>
      </EuiConfirmModal>
    </EuiOverlayMask>
  );
}

confirm.propTypes = {
  title: PropTypes.node,
  modalProps: PropTypes.object,
  body: PropTypes.node,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  cancelButtonText: PropTypes.node,
  confirmButtonText: PropTypes.node,
};
