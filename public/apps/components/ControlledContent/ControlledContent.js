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
import { EuiFlexGroup, EuiFlexItem, EuiHorizontalRule, EuiTitle, EuiTextColor } from '@elastic/eui';

const handleRenderActions = actions =>
  Array.isArray(actions) ? (
    actions.map((action, i) => <EuiFlexItem key={i}>{action}</EuiFlexItem>)
  ) : (
    <EuiFlexItem>{actions}</EuiFlexItem>
  );

const handleRenderSecondTitle = (secondTitle, secondTitleProps) => (
  <EuiFlexItem>
    <EuiTitle size="s" {...secondTitleProps}>
      <h4>
        <EuiTextColor color="secondary">{secondTitle}</EuiTextColor>
      </h4>
    </EuiTitle>
  </EuiFlexItem>
);

const ControlledContent = ({
  title,
  secondTitle,
  titleProps,
  secondTitleProps,
  horizontalRuleProps,
  bodyStyles,
  panelProps,
  headerStyles,
  actions,
  children,
}) => (
  <div {...panelProps}>
    <EuiFlexGroup
      style={{ padding: '0 1em', ...headerStyles }}
      justifyContent="spaceBetween"
      alignItems="center"
    >
      <EuiFlexItem>
        <EuiTitle size="s" {...titleProps}>
          <h2>{title}</h2>
        </EuiTitle>
        {secondTitle && handleRenderSecondTitle(secondTitle, secondTitleProps)}
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
          {handleRenderActions(actions)}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiHorizontalRule margin="s" {...horizontalRuleProps} />
    <div style={{ ...bodyStyles }}>{children}</div>
  </div>
);

ControlledContent.propTypes = {
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
  titleProps: PropTypes.object,
  secondTitle: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  secondTitleProps: PropTypes.object,
  bodyStyles: PropTypes.object,
  panelProps: PropTypes.object,
  horizontalRuleProps: PropTypes.object,
  headerStyles: PropTypes.object,
  actions: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf([PropTypes.node])]),
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf([PropTypes.node])]).isRequired,
};

ControlledContent.defaultProps = {
  titleProps: {},
  secondTitleProps: {},
  horizontalRuleProps: {},
  bodyStyles: {},
  panelProps: {},
  headerStyles: {},
};

export default ControlledContent;
