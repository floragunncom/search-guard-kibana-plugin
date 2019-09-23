import React from 'react';
import PropTypes from 'prop-types';
import { EuiEmptyPrompt, EuiButton } from '@elastic/eui';
import { addText } from '../../utils/i18n/common';

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

EmptyPrompt.defaultProps = {
  createButtonText: addText,
};

EmptyPrompt.propTypes = {
  onCreate: PropTypes.func.isRequired,
  titleText: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ]).isRequired,
  bodyText: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ]),
  createButtonText: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ])
};

export default EmptyPrompt;
