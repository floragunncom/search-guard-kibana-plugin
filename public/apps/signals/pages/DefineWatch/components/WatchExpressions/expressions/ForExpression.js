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
  * Copyright 2015-2018 _floragunn_ GmbH
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'formik';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
  EuiExpression,
} from '@elastic/eui';

import { Expressions, POPOVER_STYLE, UNITS_OF_TIME } from './utils/constants';
import { selectOptionValueToText } from './utils/helpers';
import { FormikFieldNumber, FormikSelect } from '../../../../../components';

class ForExpression extends Component {
  onChangeWrapper = (e, field) => {
    this.props.onMadeChanges();
    field.onChange(e);
  };

  renderPopover = () => (
    <div style={POPOVER_STYLE}>
      <EuiFlexGroup style={{ maxWidth: 600 }}>
        <EuiFlexItem grow={false} style={{ width: 100 }}>
          <FormikFieldNumber name="_bucketValue" elementProps={{ onChange: this.onChangeWrapper }} />
        </EuiFlexItem>

        <EuiFlexItem grow={false} style={{ width: 150 }}>
          <FormikSelect
            name="_bucketUnitOfTime"
            elementProps={{
              onChange: this.onChangeWrapper,
              options: UNITS_OF_TIME,
            }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );

  render() {
    const {
      formik: { values },
      openedStates,
      closeExpression,
      openExpression,
    } = this.props;
    return (
      <EuiPopover
        id="for-popover"
        button={
          <EuiExpression
            description="for the last"
            value={`${values._bucketValue.toLocaleString()} ${selectOptionValueToText(
              values._bucketUnitOfTime,
              UNITS_OF_TIME
            )}`}
            isActive={openedStates.FOR_THE_LAST}
            onClick={() => openExpression(Expressions.FOR_THE_LAST)}
          />
        }
        isOpen={openedStates.FOR_THE_LAST}
        closePopover={() => closeExpression(Expressions.FOR_THE_LAST)}
        panelPaddingSize="none"
        ownFocus
        withTitle
        anchorPosition="downLeft"
      >
        {this.renderPopover()}
      </EuiPopover>
    );
  }
}

ForExpression.propTypes = {
  formik: PropTypes.object.isRequired,
  openedStates: PropTypes.object.isRequired,
  openExpression: PropTypes.func.isRequired,
  closeExpression: PropTypes.func.isRequired,
};

export default connect(ForExpression);
