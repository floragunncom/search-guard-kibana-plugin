import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { EuiHorizontalRule, EuiText, EuiTitle } from '@elastic/eui';

const DEFAULT_PROPS = { size: 'xs', style: { paddingLeft: '10px' } };

const SubHeader = ({
  description,
  descriptionProps,
  horizontalRuleProps,
  title,
  titleProps,
}) => (
  <Fragment>
    <EuiTitle {...titleProps}>{title}</EuiTitle>
    <EuiHorizontalRule {...horizontalRuleProps} />
    <EuiText {...descriptionProps}>{description}</EuiText>
  </Fragment>
);

SubHeader.propTypes = {
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  descriptionProps: PropTypes.object,
  horizontalRuleProps: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  titleProps: PropTypes.object,
};

SubHeader.defaultProps = {
  descriptionProps: DEFAULT_PROPS,
  titleProps: DEFAULT_PROPS,
  horizontalRuleProps: {
    margin: 'xs'
  }
};

export default SubHeader;
