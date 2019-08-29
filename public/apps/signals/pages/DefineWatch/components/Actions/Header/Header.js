import React from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiTitle,
  EuiText,
  EuiTextColor,
  EuiIcon
} from '@elastic/eui';

const Header = ({ actionName, description, iconType }) => (
  <div>
    <EuiFlexGroup gutterSize="s" alignItems="center">
      <EuiFlexItem grow={false}>
        <EuiIcon type={iconType} size="l" />
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiTitle size="s" className="euiAccordionForm__title">
          <h6>{actionName}</h6>
        </EuiTitle>
      </EuiFlexItem>
    </EuiFlexGroup>

    <EuiText size="s">
      <p>
        <EuiTextColor color="subdued">
          {description}
        </EuiTextColor>
      </p>
    </EuiText>
  </div>
);

Header.propTypes = {
  actionName: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
  description: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
  iconType: PropTypes.string.isRequired
};

export default Header;
