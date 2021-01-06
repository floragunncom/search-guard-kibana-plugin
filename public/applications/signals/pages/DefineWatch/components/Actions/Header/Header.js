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
import { EuiFlexItem, EuiFlexGroup, EuiTitle, EuiText, EuiTextColor, EuiIcon } from '@elastic/eui';

const Header = ({ actionName, description, iconType }) => (
  <div>
    <EuiFlexGroup gutterSize="s" alignItems="center">
      {iconType && (
        <EuiFlexItem grow={false}>
          <EuiIcon type={iconType} size="l" />
        </EuiFlexItem>
      )}
      <EuiFlexItem>
        <EuiTitle size="s" className="euiAccordionForm__title">
          <h6>{actionName}</h6>
        </EuiTitle>
      </EuiFlexItem>
    </EuiFlexGroup>

    <EuiText size="s">
      <p>
        <EuiTextColor color="subdued">{description}</EuiTextColor>
      </p>
    </EuiText>
  </div>
);

Header.propTypes = {
  actionName: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
  description: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
  iconType: PropTypes.string,
};

export default Header;
