import React from 'react';
import PropTypes from 'prop-types';
import { EUI_MODAL_CONFIRM_BUTTON } from '@elastic/eui';
import {
  confirmDeleteText,
  doYouReallyWantToDeleteText,
  cancelText,
  confirmText
} from '../../../utils/i18n/common';

const confirmDeletion = ({
  title = confirmDeleteText,
  modalProps = {},
  body = null,
  onConfirm,
  onCancel,
  cancelButtonText = cancelText,
  confirmButtonText = confirmText
}) => {
  let bodyText = (<p>{doYouReallyWantToDeleteText}?</p>);
  if (body) {
    bodyText = (<p>{doYouReallyWantToDeleteText} {body}?</p>);
  }

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
    body: bodyText
  };
};

confirmDeletion.propTypes = {
  title: PropTypes.node,
  modalProps: PropTypes.object,
  body: PropTypes.node,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  cancelButtonText: PropTypes.node,
  confirmButtonText: PropTypes.node
};

export default confirmDeletion;
