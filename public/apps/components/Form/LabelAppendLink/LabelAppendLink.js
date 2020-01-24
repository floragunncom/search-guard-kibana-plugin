import React from 'react';
import PropTypes from 'prop-types';
import { EuiText, EuiLink } from '@elastic/eui';
import { documentationText } from '../../../utils/i18n/common';

const LabelAppendLink = ({ href, value, name }) => (
  <EuiText size="xs">
    <EuiLink
      data-test-subj={`sgLabelAppendLink-${name}`}
      id={`sgLabelAppendLink-${name}`}
      href={href}
      target="_blank"
    >
      {value}
    </EuiLink>
  </EuiText>
);

LabelAppendLink.propTypes = {
  href: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
};

LabelAppendLink.defaultProps = {
  value: documentationText
};

export default LabelAppendLink;
