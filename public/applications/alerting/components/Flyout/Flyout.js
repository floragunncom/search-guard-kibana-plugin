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
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFlyoutFooter,
  EuiErrorBoundary,
} from '@elastic/eui';
import Flyouts from './flyouts';

const getFlyoutProps = ({ type, payload }) => {
  const flyout = Flyouts[type];
  if (!flyout || !(flyout instanceof Function)) return null;
  return flyout(payload);
};

const Flyout = ({ flyout, onClose }) => {
  if (!flyout) return null;

  const flyoutData = getFlyoutProps(flyout);
  if (!flyoutData) return null;

  const {
    header = null,
    body = null,
    footer = null,
    flyoutProps = {},
    headerProps = {},
    bodyProps = {},
    footerProps = {},
  } = flyoutData;

  return (
    <EuiFlyout onClose={onClose} {...flyoutProps} className="sgFlyout">
      <EuiErrorBoundary>
        {header && <EuiFlyoutHeader {...headerProps}>{header}</EuiFlyoutHeader>}
        {body && <EuiFlyoutBody {...bodyProps}>{body}</EuiFlyoutBody>}
        {footer && <EuiFlyoutFooter {...footerProps}>{footer}</EuiFlyoutFooter>}
      </EuiErrorBoundary>
    </EuiFlyout>
  );
};

Flyout.propTypes = {
  flyout: PropTypes.shape({
    type: PropTypes.string.isRequired,
    payload: PropTypes.any,
    onChange: PropTypes.func,
  }),
  onClose: PropTypes.func.isRequired,
};

export default Flyout;
