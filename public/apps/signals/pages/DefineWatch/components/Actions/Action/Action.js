import React from 'react';
import PropTypes from 'prop-types';
import { EuiAccordion } from '@elastic/eui';

const Action = ({ actionHeader, deleteButton, actionBody, id, name }) => (
  <EuiAccordion
    id={id}
    data-test-subj={`sgWatchAction-${name}`}
    className="euiAccordionForm"
    buttonClassName="euiAccordionForm__button"
    buttonContent={actionHeader}
    extraAction={deleteButton}
    paddingSize="l"
  >
    {actionBody}
  </EuiAccordion>
);

Action.propTypes = {
  actionHeader: PropTypes.node.isRequired,
  deleteButton: PropTypes.node.isRequired,
  actionBody: PropTypes.node.isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};

export default Action;
