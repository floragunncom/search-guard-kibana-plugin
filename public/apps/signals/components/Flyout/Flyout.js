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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import { EuiFlyout, EuiFlyoutBody, EuiFlyoutHeader, EuiFlyoutFooter } from '@elastic/eui';
import Flyouts from './flyouts';

const getFlyoutProps = ({ type, payload }) => {
  const flyout = Flyouts[type];
  if (!flyout || !(flyout instanceof Function)) return null;
  return flyout(payload);
};

const Flyout = ({ flyout, onClose }) => {
  const [values, setValues] = useState({});
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
    formikProps = {},
    onChange,
  } = flyoutData;

  return (
    <Formik
      {...formikProps}
      render={({ errors, values, ...restRenderProps }) => {
        console.log('Flyout, restRenderProps', restRenderProps);
        console.log('Flyout, errors', errors);
        console.log('Flyout, values', values);

        const hasNoErrors = !Object.keys(errors).length;
        console.log('hasNoErrors', hasNoErrors);
        const didValuesChange = JSON.stringify(values) !== JSON.stringify(values);
        console.log('didValuesChange', didValuesChange);
        const isChangingParentValues =
          typeof onChange === 'function' && didValuesChange && hasNoErrors;
        console.log('isChangingParentValues', isChangingParentValues);

        if (isChangingParentValues) {
          onChange(values);
        }

        return (
          <EuiFlyout onClose={onClose} {...flyoutProps} className="sgFlyout">
            {header && <EuiFlyoutHeader {...headerProps}>{header}</EuiFlyoutHeader>}
            {body && <EuiFlyoutBody {...bodyProps}>{body}</EuiFlyoutBody>}
            {footer && <EuiFlyoutFooter {...footerProps}>{footer}</EuiFlyoutFooter>}
          </EuiFlyout>
        );
      }}
    />
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
