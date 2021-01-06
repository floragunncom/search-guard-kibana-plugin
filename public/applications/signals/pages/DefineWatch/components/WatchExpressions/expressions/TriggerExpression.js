/*
 *    Copyright 2020 floragunn GmbH
 *
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
import PropTypes from 'prop-types';
import { connect as connectToFormik } from 'formik';
import { get } from 'lodash';
import { EuiExpression, EuiFlexGroup, EuiFlexItem, EuiPopover } from '@elastic/eui';
import { POPOVER_STYLE, THRESHOLD_ENUM_OPTIONS } from './utils/constants';
import { FormikFieldNumber, FormikSelect } from '../../../../../components';
import SeverityForm from '../../SeverityForm';

export const Expressions = { THRESHOLD: 'THRESHOLD' };

class TriggerExpression extends Component {
  onChangeThresholdWrapper = (e, field) => {
    this.props.onMadeChanges();
    field.onChange(e);
  };

  renderSeverityPopover() {
    const { payloadFields } = this.props;

    return (
      <div style={POPOVER_STYLE}>
        <SeverityForm isCompressed fields={payloadFields} />
      </div>
    );
  }

  renderThresholdPopover() {
    return (
      <div style={POPOVER_STYLE}>
        <EuiFlexGroup style={{ maxWidth: 600 }}>
          <EuiFlexItem grow={false} style={{ width: 150 }}>
            <FormikSelect
              name="_ui.thresholdEnum"
              elementProps={{
                options: THRESHOLD_ENUM_OPTIONS,
                onChange: this.onChangeThresholdWrapper,
              }}
            />
          </EuiFlexItem>

          <EuiFlexItem grow={false} style={{ width: 100 }}>
            <FormikFieldNumber
              name="_ui.thresholdValue"
              elementProps={{
                onChange: this.onChangeThresholdWrapper,
              }}
              rowProps={{
                style: { paddingLeft: '10px' },
              }}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }

  render() {
    const {
      formik: { values },
      openedStates,
      closeExpression,
      openExpression,
    } = this.props;

    const isSeverity = get(values, '_ui.isSeverity', false);
    let thresholdDescr = `IS ${get(values, '_ui.thresholdEnum')}`;
    let thresholdValue = get(values, '_ui.thresholdValue');
    thresholdValue = thresholdValue.toLocaleString();
    let expressionColor = 'secondary';

    if (isSeverity) {
      const severityField = get(values, '_ui.severity.value[0].label', '');
      if (!severityField) {
        expressionColor = 'danger';
      }

      let severityThresholds = get(values, '_ui.severity.thresholds', {});
      severityThresholds = Object.values(severityThresholds)
        .filter((value) => value)
        .join(',');

      thresholdDescr = 'severity conditions';
      thresholdValue = `${severityField.slice(0, 20)} ... ${severityThresholds}`;
    }

    return (
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiPopover
            id="trigger-popover"
            button={
              <EuiExpression
                color={expressionColor}
                description={thresholdDescr}
                value={thresholdValue}
                isActive={openedStates.THRESHOLD}
                onClick={() => openExpression(Expressions.THRESHOLD)}
              />
            }
            isOpen={openedStates.THRESHOLD}
            closePopover={() => closeExpression(Expressions.THRESHOLD)}
            panelPaddingSize="none"
            ownFocus
            withTitle
            anchorPosition="downLeft"
          >
            {isSeverity ? this.renderSeverityPopover() : this.renderThresholdPopover()}
          </EuiPopover>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}

TriggerExpression.propTypes = {
  formik: PropTypes.object.isRequired,
  openedStates: PropTypes.object.isRequired,
  openExpression: PropTypes.func.isRequired,
  onMadeChanges: PropTypes.func.isRequired,
  closeExpression: PropTypes.func.isRequired,
};

export default connectToFormik(TriggerExpression);
