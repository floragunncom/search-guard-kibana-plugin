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
import { EuiOverlayMask, EuiConfirmModal, EuiText } from '@elastic/eui';
import Modals from './modals';

const getModalProps = ({ type, payload }) => {
  const modal = Modals[type];
  if (!modal || !(modal instanceof Function)) return null;
  return modal(payload);
};

const Modal = ({ modal, onClose }) => {
  if (!modal) return null;
  const modalData = getModalProps(modal);
  if (!modalData) return null;
  const {
    modalProps,
    title,
    onConfirm,
    onCancel = onClose,
    body,
    cancelButtonText,
    confirmButtonText,
  } = modalData;

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
};

Modal.propTypes = {
  modal: PropTypes.shape({
    type: PropTypes.string.isRequired,
    payload: PropTypes.any.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};

export default Modal;
