/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { EuiFlexGroup, EuiFlexItem, EuiText, EuiLink, EuiFlexGrid, EuiIcon } from '@elastic/eui';
import { reservedText } from '../../../utils/i18n/common';

const TableNameCell = ({ history, uri, name, isReserved = false, children }) => (
  <div className="sgTableTableNameCell">
    <EuiFlexGroup>
      <EuiFlexItem>
        {isReserved ? (
          <EuiText data-test-subj={`sgTableCol-Name-${name}`} size="s">
            {name}
          </EuiText>
        ) : (
          <EuiLink data-test-subj={`sgTableCol-Name-${name}`} onClick={() => history.push(uri)}>
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
  children: PropTypes.node,
};

export default TableNameCell;
