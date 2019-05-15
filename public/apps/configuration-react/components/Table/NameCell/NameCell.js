import React from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiLink,
  EuiFlexGrid,
  EuiIcon
} from '@elastic/eui';
import { reservedText } from '../../../utils/i18n/common';

const NameCell = ({ history, uri, name, resource, children }) => (
  <div>
    <EuiFlexGroup>
      <EuiFlexItem>
        {resource.reserved ? (
          <EuiText size="s">{name}</EuiText>
        ) : (
          <EuiLink onClick={() => history.push(uri)}>{name}</EuiLink>
        )
        }
      </EuiFlexItem>
    </EuiFlexGroup>
    {resource.reserved && (
      <EuiFlexGrid columns={2} gutterSize="s" responsive={false}>
        <EuiFlexItem grow={false}>
          <EuiIcon type="lock"/>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText size="s">{reservedText}</EuiText>
        </EuiFlexItem>
      </EuiFlexGrid>
    )}
    {children}
  </div>
);

NameCell.propTypes = {
  history: PropTypes.object.isRequired,
  uri: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  resource: PropTypes.object.isRequired,
  children: PropTypes.node
};

export default NameCell;
