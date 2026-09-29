/*
 *    Copyright 2026 floragunn GmbH
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
import { ProxyField } from '../../ProxyField';

// Proxy field of the actions that support one: webhook (and Signl4), Jira and PagerDuty.
const ActionProxy = ({ isResolveActions, index }) => {
  const path = isResolveActions ? `resolve_actions[${index}].proxy` : `actions[${index}].proxy`;
  return <ProxyField path={path} />;
};

ActionProxy.defaultProps = {
  isResolveActions: false,
};

ActionProxy.propTypes = {
  isResolveActions: PropTypes.bool,
  index: PropTypes.number.isRequired,
};

export default ActionProxy;
