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
import { EuiText } from '@elastic/eui';

const TableTextCell = ({ name, value, textProps = {} } = {}) => (
  <div data-test-subj={`sgTableCol-${name}`}>
    <EuiText size="s" {...textProps}>
      {value}
    </EuiText>
  </div>
);

TableTextCell.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
};

export default TableTextCell;
