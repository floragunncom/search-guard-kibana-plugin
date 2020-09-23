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

import React, { Component } from 'react';
import { connect } from 'formik';
import {
  EuiPopover,
  EuiExpression,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { FormikComboBox, FormikSelect, FormikFieldNumber } from '../../../../../components';
import { getOptions } from './utils/dataTypes';
import { POPOVER_STYLE, Expressions, OVER_TYPES, ORDER_TYPES } from './utils/constants';
import { AGGREGATIONS_TYPES } from '../../../utils/constants';
import { validateEmptyComboBox, isInvalid, hasError } from '../../../../../utils/validate';

import { Context } from '../../../../../Context';

class OverExpression extends Component {
  static contextType = Context;

  onChangeWrapper = (e, field) => {
    this.props.onMadeChanges();
    field.onChange(e);
  };

  renderTypeSelect = () => (
    <FormikSelect
      name="_ui.overDocuments"
      elementProps={{
        'data-test-subj': 'overAggType',
        options: OVER_TYPES,
        onChange: this.onChangeWrapper,
      }}
    />
  );

  renderTopHitsOrderSelect = () => (
    <FormikSelect
      name="_ui.topHitsAgg.order"
      elementProps={{
        'data-test-subj': 'topHitsAggOrderField',
        options: ORDER_TYPES,
        onChange: this.onChangeWrapper,
      }}
    />
  );

  renderTopHitsSizeField = () => (
    <FormikFieldNumber
      name="_ui.topHitsAgg.size"
      elementProps={{
        'data-test-subj': 'topHitsAggSizeField',
        onChange: this.onChangeWrapper,
      }}
    />
  );

  renderTopHitsTermField = (options = []) => (
    <FormikComboBox
      name="_ui.topHitsAgg.field"
      formRow
      rowProps={{
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        isInvalid,
        'data-test-subj': 'topHitsAggTermField',
        placeholder: 'Select a field',
        options,
        isClearable: false,
        singleSelection: { asPlainText: true },
        onChange: (options, field, form) => {
          this.props.onMadeChanges();
          this.context.onComboBoxChange(validateEmptyComboBox)(options, field, form);
        },
      }}
      formikFieldProps={{
        validate: validateEmptyComboBox,
      }}
    />
  );

  renderOverPopover = () => (
    <div style={POPOVER_STYLE}>
      <div style={{ width: 200 }}>{this.renderTypeSelect()}</div>
    </div>
  );

  renderTopHitsPopover = ({ termFieldOptions, termFieldWidth }) => (
    <div style={POPOVER_STYLE}>
      <EuiFlexGroup style={{ maxWidth: 600 }}>
        <EuiFlexItem grow={false} style={{ width: 100 }}>
          {this.renderTypeSelect()}
        </EuiFlexItem>

        <EuiFlexItem grow={false} style={{ width: 100 }}>
          {this.renderTopHitsSizeField()}
        </EuiFlexItem>

        <EuiFlexItem grow={false} style={{ width: 100 }}>
          {this.renderTopHitsOrderSelect()}
        </EuiFlexItem>

        <EuiFlexItem grow={false} style={{ width: termFieldWidth }}>
          {this.renderTopHitsTermField(termFieldOptions)}
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
      dataTypes,
    } = this.props;

    const isTopHits = values._ui.overDocuments === AGGREGATIONS_TYPES.TOP_HITS;
    const { size: topHitsSize, field: [{ label: topHitsField } = {}] } = values._ui.topHitsAgg;
    const buttonValue = isTopHits
      ? `${values._ui.overDocuments} ${topHitsSize} ${topHitsField || 'Select a field'}`
      : values._ui.overDocuments;

    let termFieldOptions = [];
    let termFieldWidth = 180;
    let expressionColor = 'secondary';

    if (isTopHits) {
      if (!topHitsField) {
        expressionColor = 'danger';
      }
      termFieldOptions = getOptions(dataTypes, values, ['keyword', 'number']);
      termFieldWidth =
        Math.max(
          ...termFieldOptions.map(({ options }) =>
            options.reduce((accu, curr) => Math.max(accu, curr.label.length), 0)
          )
        ) * 8 + 60;
    }

    return (
      <EuiPopover
        id="over-popover"
        button={
          <EuiExpression
            color={expressionColor}
            description={isTopHits ? 'grouped over' : 'over'}
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
        {isTopHits ? this.renderTopHitsPopover({ termFieldOptions, termFieldWidth }) : this.renderOverPopover()}
      </EuiPopover>
    );
  }
}

export default connect(OverExpression);
