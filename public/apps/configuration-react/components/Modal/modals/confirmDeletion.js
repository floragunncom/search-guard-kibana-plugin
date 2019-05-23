import React from 'react';
import PropTypes from 'prop-types';
import {
  confirmDeleteText,
  doYouReallyWantToDeleteText,
  cancelText,
  confirmText
} from '../../../utils/i18n/common';
import { EUI_MODAL_CONFIRM_BUTTON } from '@elastic/eui';

const confirmDeletion = ({
  title = confirmDeleteText,
  modalProps = {},
  body = null,
  onConfirm,
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
    title,
    body: bodyText
  };
};

confirmDeletion.propTypes = {
  title: PropTypes.node,
  modalProps: PropTypes.object,
  body: PropTypes.node,
  onConfirm: PropTypes.func.isRequired,
  cancelButtonText: PropTypes.node,
  confirmButtonText: PropTypes.node
};

export default confirmDeletion;
