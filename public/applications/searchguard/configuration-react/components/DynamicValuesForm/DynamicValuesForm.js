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

import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { EuiFlexGroup, EuiFlexItem, EuiButton, EuiText } from '@elastic/eui';
import { addText, removeText, noItemsFoundText } from '../../utils/i18n/common';

const renderTitle = ({ title, titleSize }) => (
  <EuiFlexItem className="sgDynamicValuesForm__title">
    <EuiText size={titleSize}>{title}</EuiText>
  </EuiFlexItem>
);

const renderValues = ({
  items,
  name,
  removeButtonText,
  onRemove,
  onRenderValueField,
  removeButtonSize,
  isKey,
  onRenderKeyField,
}) =>
  items.map((item, index) => (
    <EuiFlexItem key={`${name}.${index}.key`} className="sgDynamicValuesForm__item">
      <EuiFlexGroup alignItems="center">
        {isKey ? (
          <EuiFlexItem>{onRenderKeyField(`${name}.${index}.key`, index)}</EuiFlexItem>
        ) : null}
        <EuiFlexItem>{onRenderValueField(`${name}.${index}.value`, index)}</EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            data-test-subj={`sgDynamicValuesFormRemoveButton-${index}`}
            size={removeButtonSize}
            fill
            color="danger"
            iconType="trash"
            onClick={() => onRemove(index)}
          >
            {removeButtonText}
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiFlexItem>
  ));

const renderEmpty = ({ emptyText, emptyTextSize }) => (
  <EuiFlexItem className="sgDynamicValuesForm__empty">
    <EuiText size={emptyTextSize}>{emptyText}</EuiText>
  </EuiFlexItem>
);

const renderAddButton = ({ addButtonText, onAdd, addButtonSize }) => (
  <EuiFlexItem>
    <EuiButton
      data-test-subj="sgDynamicValuesFormAddButton"
      size={addButtonSize}
      onClick={onAdd}
      iconType="plusInCircle"
    >
      {addButtonText}
    </EuiButton>
  </EuiFlexItem>
);

const DynamicValuesForm = ({
  isKey = false,
  title,
  titleSize = 'm',
  onAdd,
  onRemove,
  items = [],
  name,
  addButtonSize = 's',
  removeButtonSize = 's',
  addButtonText = addText,
  removeButtonText = removeText,
  onRenderValueField,
  emptyText = noItemsFoundText,
  emptyTextSize = 's',
  onRenderKeyField,
}) => (
  <EuiFlexGroup direction="column" alignItems="flexStart" className="sgDynamicValuesForm">
    {!isEmpty(title) ? renderTitle({ title, titleSize }) : null}
    {!isEmpty(items)
      ? renderValues({
          items,
          name,
          removeButtonText,
          onRemove,
          onRenderValueField,
          removeButtonSize,
          isKey,
          onRenderKeyField,
        })
      : renderEmpty({ emptyText, emptyTextSize })}
    {renderAddButton({ addButtonText, onAdd, addButtonSize })}
  </EuiFlexGroup>
);

DynamicValuesForm.propTypes = {
  title: PropTypes.node,
  titleSize: PropTypes.string,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string })).isRequired,
  name: PropTypes.string.isRequired,
  addButtonSize: PropTypes.string,
  removeButtonSize: PropTypes.string,
  addButtonText: PropTypes.node,
  removeButtonText: PropTypes.node,
  emptyText: PropTypes.node,
  onRenderValueField: PropTypes.func.isRequired,
  onRenderKeyField: PropTypes.func,
  emptyTextSize: PropTypes.string,
  isKey: PropTypes.bool,
};

export default DynamicValuesForm;
