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
import { connect } from 'formik';
import {
  EuiPopover,
  EuiExpression,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';

import { POPOVER_STYLE, Expressions, OVER_TYPES } from './utils/constants';
import { FormikSelect, FormikFieldNumber } from '../../../../../components';

class OverExpression extends Component {
  onChangeWrapper = (e, field) => {
    this.props.onMadeChanges();
    field.onChange(e);
  };

  renderTypeSelect = () => (
    <FormikSelect
      name="_overDocuments"
      elementProps={{ onChange: this.onChangeWrapper, options: OVER_TYPES }}
    />
  );

  renderTopFieldNumber = () => (
    <FormikFieldNumber name="_groupedOverTop" elementProps={{ onChange: this.onChangeWrapper }} />
  );

  renderTermField = (fields = []) => (
    <FormikSelect
      name="_groupedOverFieldName"
      elementProps={{ onChange: this.onChangeWrapper, options: fields }}
    />
  );

  renderOverPopover = () => (
    <div style={POPOVER_STYLE}>
      <div style={{ width: 200 }}>{this.renderTypeSelect()}</div>
    </div>
  );

  renderGroupedPopover = () => (
    <div style={POPOVER_STYLE}>
      <EuiFlexGroup style={{ maxWidth: 600 }}>
        <EuiFlexItem grow={false} style={{ width: 100 }}>
          {this.renderTypeSelect()}
        </EuiFlexItem>

        <EuiFlexItem grow={false} style={{ width: 100 }}>
          {this.renderTopFieldNumber()}
        </EuiFlexItem>

        <EuiFlexItem grow={false} style={{ width: 180 }}>
          {this.renderTermField()}
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
    const isGroupedOver = values._overDocuments === 'top';
    const buttonValue = isGroupedOver
      ? `${values._overDocuments} ${values._groupedOverTop} ${values._groupedOverFieldName}`
      : values._overDocuments;
    return (
      <EuiPopover
        id="over-popover"
        button={
          <EuiExpression
            description={isGroupedOver ? 'grouped over' : 'over'}
            value={buttonValue}
            isActive={openedStates.OVER}
            onClick={() => openExpression(Expressions.OVER)}
          />
        }
        isOpen={openedStates.OVER}
        closePopover={() => closeExpression(Expressions.OVER)}
        panelPaddingSize="none"
        ownFocus
        withTitle
        anchorPosition="downLeft"
      >
        {this.renderOverPopover()}
      </EuiPopover>
    );
  }
}

export default connect(OverExpression);
