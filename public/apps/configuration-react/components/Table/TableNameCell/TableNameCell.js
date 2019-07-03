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

const TableNameCell = ({ history, uri, name, isReserved = false, children }) => (
  <div className="sgTableTableNameCell">
    <EuiFlexGroup>
      <EuiFlexItem>
        {isReserved ? (
          <EuiText data-test-subj={`sgTableCol-Name-${name}`} size="s">{name}</EuiText>
        ) : (
          <EuiLink
            data-test-subj={`sgTableCol-Name-${name}`}
            onClick={() => history.push(uri)}
          >
            {name}
          </EuiLink>
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
    {isReserved && (
      <EuiFlexGrid
        columns={2}
        gutterSize="s"
        responsive={false}
        data-test-subj={`sgTableCol-Name-${name}-Reserved`}
      >
        <EuiFlexItem grow={false}>
          <EuiIcon type="lock" />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText size="s">{reservedText}</EuiText>
        </EuiFlexItem>
      </EuiFlexGrid>
    )}
    {children}
  </div>
);

TableNameCell.propTypes = {
  history: PropTypes.object.isRequired,
  uri: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  isReserved: PropTypes.bool,
  children: PropTypes.node
};

export default TableNameCell;
