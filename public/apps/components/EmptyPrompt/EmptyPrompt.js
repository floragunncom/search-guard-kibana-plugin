import React from 'react';
import PropTypes from 'prop-types';
import { EuiEmptyPrompt } from '@elastic/eui';
import AddButton from '../Page/AddButton';

const EmptyPrompt = ({
  titleText,
  titleSize,
  bodyText,
  onCreate
}) => (
  <EuiEmptyPrompt
    title={<h3>{titleText}</h3>}
    titleSize={titleSize}
    body={bodyText}
    actions={<AddButton onClick={onCreate} />}
  />
);

EmptyPrompt.propTypes = {
  onCreate: PropTypes.func.isRequired,
  titleText: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ]).isRequired,
  bodyText: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ])
};

EmptyPrompt.defaultProps = {
  titleSize: 'xs'
};

export default EmptyPrompt;
