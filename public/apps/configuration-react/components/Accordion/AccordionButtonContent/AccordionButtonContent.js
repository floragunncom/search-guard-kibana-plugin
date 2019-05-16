import React from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiIcon,
  EuiTextColor,
  EuiText
} from '@elastic/eui';

const AccordionButtonContent = ({ subduedText, titleText, iconType }) => (
  <div>
    <EuiFlexGroup gutterSize="s" alignItems="center">
      <EuiFlexItem grow={false}>
        <EuiIcon type={iconType} size="l" />
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiTitle size="xs" className="euiAccordionForm__title">
          <h4>{titleText}</h4>
        </EuiTitle>
      </EuiFlexItem>
    </EuiFlexGroup>

    <EuiText size="s">
      <p>
        <EuiTextColor color="subdued">{subduedText}</EuiTextColor>
      </p>
    </EuiText>
  </div>
);

AccordionButtonContent.propTypes = {
  subduedText: PropTypes.node.isRequired,
  titleText: PropTypes.node.isRequired,
  iconType: PropTypes.string.isRequired
};

export default AccordionButtonContent;
