import React from 'react';
import PropTypes from 'prop-types';
import { EuiEmptyPrompt, EuiButton } from '@elastic/eui';

const EmptyPrompt = ({ titleText, bodyText, createButtonText, onCreate }) => (
  <EuiEmptyPrompt
    title={<h3>{titleText}</h3>}
    titleSize="xs"
    body={bodyText}
    actions={(
      <EuiButton
        size="s"
        iconType="plusInCircle"
        onClick={onCreate}
      >
        {createButtonText}
      </EuiButton>
    )}
  />
);

EmptyPrompt.propTypes = {
  onCreate: PropTypes.func.isRequired,
  titleText: PropTypes.node.isRequired,
  bodyText: PropTypes.node.isRequired,
  createButtonText: PropTypes.node.isRequired
};

export default EmptyPrompt;
