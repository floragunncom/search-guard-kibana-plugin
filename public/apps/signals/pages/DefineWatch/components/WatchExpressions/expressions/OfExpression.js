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
import _ from 'lodash';
import { EuiPopover, EuiExpression } from '@elastic/eui';

import { FormikComboBox } from '../../../../../components';
import { POPOVER_STYLE, Expressions } from './utils/constants';
import { getOptions } from './utils/dataTypes';

// TODO: EuiComboBox has an internal setState issue, waiting for EUI to fix it, remove this TODO when it is fixed

class OfExpression extends Component {
  onChangeWrapper = (options, field, form) => {
    this.props.onMadeChanges();
    form.setFieldValue(field.name, options);
  };

  renderPopover = (options, expressionWidth) => (
    <div style={POPOVER_STYLE}>
      <div style={{ width: expressionWidth }}>
        <FormikComboBox
          name="_fieldName"
          elementProps={{
            placeholder: 'Select a field',
            options,
            onChange: this.onChangeWrapper,
            isClearable: false,
            singleSelection: { asPlainText: true },
            'data-test-subj': 'ofFieldComboBox',
          }}
        />
      </div>
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
    const options = getOptions(dataTypes, values);
    const expressionWidth =
      Math.max(
        ...options.map(({ options }) =>
          options.reduce((accu, curr) => Math.max(accu, curr.label.length), 0)
        )
      ) *
        8 +
      60;
    const fieldName = _.get(values, '_fieldName[0].label', 'Select a field');
    return (
      <EuiPopover
        id="of-popover"
        button={
          <EuiExpression
            description="of"
            value={fieldName}
            isActive={openedStates.OF_FIELD}
            onClick={() => openExpression(Expressions.OF_FIELD)}
          />
        }
        isOpen={openedStates.OF_FIELD}
        closePopover={() => closeExpression(Expressions.OF_FIELD)}
        panelPaddingSize="none"
        ownFocus
        withTitle
        anchorPosition="downLeft"
      >
        {this.renderPopover(options, expressionWidth)}
      </EuiPopover>
    );
  }
}

export default connect(OfExpression);
