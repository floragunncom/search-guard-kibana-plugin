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
} from '@elastic/eui';

import { Expressions, POPOVER_STYLE, AGGREGATION_TYPES } from './utils/constants';
import { selectOptionValueToText } from './utils/helpers';
import { FormikSelect } from '../../../../../components';

class WhenExpression extends Component {
  onChangeWrapper = (e, field) => {
    this.props.onMadeChanges();
    field.onChange(e);
  };

  renderPopover = () => (
    <div style={POPOVER_STYLE}>
      <div style={{ width: 180 }}>
        <FormikSelect
          name="_aggregationType"
          elementProps={{
            onChange: this.onChangeWrapper,
            options: AGGREGATION_TYPES,
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
    } = this.props;
    return (
      <EuiPopover
        id="when-popover"
        button={
          <EuiExpression
            description="when"
            value={selectOptionValueToText(values._aggregationType, AGGREGATION_TYPES)}
            isActive={openedStates.WHEN}
            onClick={() => openExpression(Expressions.WHEN)}
          />
        }
        isOpen={openedStates.WHEN}
        closePopover={() => closeExpression(Expressions.WHEN)}
        panelPaddingSize="none"
        ownFocus
        withTitle
        anchorPosition="downLeft"
      >
        {this.renderPopover(values)}
      </EuiPopover>
    );
  }
}

export default connect(WhenExpression);
