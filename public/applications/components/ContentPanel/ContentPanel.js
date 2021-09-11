/* eslint-disable @osd/eslint/require-license-header */
/*
 *   Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

/*
 * Copyright 2015-2019 _floragunn_ GmbH
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
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiTitle,
  EuiText,
  EuiErrorBoundary,
} from '@elastic/eui';
import { LoadingPage } from '../index';

const handleRenderActions = (actions) =>
  Array.isArray(actions) ? (
    actions.map((action, i) => <EuiFlexItem key={i}>{action}</EuiFlexItem>)
  ) : (
    <EuiFlexItem>{actions}</EuiFlexItem>
  );

const ContentPanel = ({
  title,
  description,
  titleSize = 'm',
  horizontalRuleMargin = 's',
  bodyStyles = {},
  panelStyles = {},
  headerStyles = {},
  panelDivProps = {},
  actions,
  children,
  isLoading = false,
}) => {
  return (
    <div style={{ ...panelStyles }} className="sgContentPanel" {...panelDivProps}>
      <EuiFlexGroup
        style={{ ...headerStyles }}
        className="sgContentPanel__header"
        justifyContent="spaceBetween"
        alignItems="center"
      >
        <EuiFlexItem>
          <EuiTitle size={titleSize}>
            <h2>{title}</h2>
          </EuiTitle>
          {description && <EuiText>{description}</EuiText>}
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
            {handleRenderActions(actions)}
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiHorizontalRule margin={horizontalRuleMargin} />

      {isLoading ? (
        LoadingPage
      ) : (
        <EuiErrorBoundary>
          <div style={{ ...bodyStyles }} className="sgContentPanel__body">
            {children}
          </div>
        </EuiErrorBoundary>
      )}
    </div>
  );
};

ContentPanel.propTypes = {
  title: PropTypes.node,
  description: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  titleSize: PropTypes.string,
  bodyStyles: PropTypes.object,
  panelStyles: PropTypes.object,
  headerStyles: PropTypes.object,
  panelDivProps: PropTypes.object,
  actions: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf([PropTypes.node])]),
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf([PropTypes.node])]).isRequired,
  isLoading: PropTypes.bool,
};

export default ContentPanel;
