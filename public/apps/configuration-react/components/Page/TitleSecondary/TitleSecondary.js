import React from 'react';
import PropTypes from 'prop-types';
import { EuiTitle, EuiTextColor } from '@elastic/eui';

const TitleSecondary = ({ text, size = 'xs' }) => (
  <EuiTitle size={size}>
    <h4>
      <EuiTextColor color="secondary">{text}</EuiTextColor>
    </h4>
  </EuiTitle>
);

TitleSecondary.propTypes = {
  text: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]).isRequired,
  size: PropTypes.string
};

export default TitleSecondary;
