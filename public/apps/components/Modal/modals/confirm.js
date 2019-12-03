import React from 'react';
import PropTypes from 'prop-types';
import { EUI_MODAL_CONFIRM_BUTTON } from '@elastic/eui';
import {
  cancelText,
  confirmText
} from '../../../utils/i18n/common';

const confirm = ({
  title = confirmText,
  modalProps = {},
  body = null,
  onConfirm,
  onCancel,
  cancelButtonText = cancelText,
  confirmButtonText = confirmText
}) => {
  return {
    modalProps: {
      ...modalProps,
      buttonColor: 'danger',
      defaultFocusedButton: EUI_MODAL_CONFIRM_BUTTON
    },
    cancelButtonText,
    confirmButtonText,
    onConfirm,
    onCancel,
    title,
    body
  };
};

confirm.propTypes = {
  title: PropTypes.node,
  modalProps: PropTypes.object,
  body: PropTypes.node,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  cancelButtonText: PropTypes.node,
  confirmButtonText: PropTypes.node
};

export default confirm;
