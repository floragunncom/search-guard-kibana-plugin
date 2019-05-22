import React from 'react';
import PropTypes from 'prop-types';
import { EuiButtonIcon } from '@elastic/eui';

const AccordionDeleteButton = ({ onClick }) => (
  <EuiButtonIcon
    iconType="cross"
    color="danger"
    className="euiAccordionForm__extraAction"
    aria-label="Delete"
    onClick={onClick}
  />
);

AccordionDeleteButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default AccordionDeleteButton;
