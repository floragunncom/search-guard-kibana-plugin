import React from 'react';
import PropTypes from 'prop-types';
import { EuiButtonIcon } from '@elastic/eui';

const DeleteActionButton = ({ onDeleteAction, name }) => (
  <EuiButtonIcon
    iconType="cross"
    color="danger"
    className="euiAccordionForm__extraAction"
    aria-label="Delete"
    data-test-subj={`sgWatchAction-Delete-${name}`}
    onClick={() => onDeleteAction()}
  />
);

DeleteActionButton.propTypes = {
  onDeleteAction: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired
};

export default DeleteActionButton;
