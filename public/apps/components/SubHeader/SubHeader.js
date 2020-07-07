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

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { EuiHorizontalRule, EuiText, EuiTitle, EuiErrorBoundary } from '@elastic/eui';

const DEFAULT_PROPS = { size: 'xs', style: { paddingLeft: '10px' } };

const SubHeader = ({
  description,
  descriptionProps,
  horizontalRuleProps,
  title,
  titleProps
}) => (
  <EuiErrorBoundary>
    <EuiTitle {...titleProps}>{title}</EuiTitle>
    <EuiHorizontalRule {...horizontalRuleProps} />
    <EuiText {...descriptionProps}>{description}</EuiText>
  </EuiErrorBoundary>
);

SubHeader.propTypes = {
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  descriptionProps: PropTypes.object,
  horizontalRuleProps: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  titleProps: PropTypes.object
};

SubHeader.defaultProps = {
  descriptionProps: DEFAULT_PROPS,
  titleProps: DEFAULT_PROPS,
  horizontalRuleProps: {
    margin: 'xs'
  }
};

export default SubHeader;
