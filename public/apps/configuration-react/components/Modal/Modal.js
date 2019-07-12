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
    onCancel,
    body,
    cancelButtonText,
    confirmButtonText
  } = modalData;

  return (
    <EuiOverlayMask>
      <EuiConfirmModal
        className="sgConfirmModal"
        title={title}
        onCancel={onCancel ? onCancel : onClose}
        onConfirm={onConfirm}
        cancelButtonText={cancelButtonText}
        confirmButtonText={confirmButtonText}
        {...modalProps}
      >
        <EuiText className="sgConfirmModalBody" data-test-subj="sgConfirmModalBody">{body}</EuiText>
      </EuiConfirmModal>
    </EuiOverlayMask>
  );
};

Modal.propTypes = {
  modal: PropTypes.shape({
    type: PropTypes.string.isRequired,
    payload: PropTypes.any.isRequired
  }),
  onClose: PropTypes.func.isRequired
};

export default Modal;
