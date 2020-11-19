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

import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'formik';
import { EuiSpacer } from '@elastic/eui';
import {
  FormikFieldText,
  FormikCodeEditor,
  FormikSwitch,
  DynamicValuesForm,
  SubHeader,
} from '../../../../components';
import {
  hasError,
  isInvalid,
  validateTextField,
  validateJsonString,
} from '../../../../utils/validation';
import { userAttributesText, complexAttributesText } from '../../../../utils/i18n/internal_users';

import { Context } from '../../../../Context';

function SimpleUserAttributes({ attributes }) {
  const { triggerConfirmDeletionModal } = useContext(Context);

  const renderValueField = (fieldName) => (
    <FormikFieldText
      formRow
      formikFieldProps={{
        validate: validateTextField,
      }}
      rowProps={{
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        isInvalid,
      }}
      name={fieldName}
    />
  );

  const renderKeyField = (fieldName) => (
    <FormikFieldText
      formRow
      formikFieldProps={{
        validate: validateTextField,
      }}
      rowProps={{
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        isInvalid,
      }}
      name={fieldName}
    />
  );

  return (
    <FieldArray name="_attributes" validateOnChange={false}>
      {(arrayHelpers) => (
        <DynamicValuesForm
          isKey
          onAdd={() => arrayHelpers.push({ key: '', value: '' })}
          onRemove={(i) => {
            triggerConfirmDeletionModal({
              onConfirm: () => {
                arrayHelpers.remove(i);
                triggerConfirmDeletionModal(null);
              },
            });
          }}
          items={attributes}
          name="_attributes"
          onRenderValueField={renderValueField}
          onRenderKeyField={renderKeyField}
        />
      )}
    </FieldArray>
  );
}

function ComplexUserAttributes() {
  const { editorOptions, editorTheme } = useContext(Context);

  return (
    <div id="sgCreateInternalUser_complex_attributes">
      <EuiSpacer />
      <FormikCodeEditor
        name="_attributesString"
        formRow
        formikFieldProps={{
          validate: validateJsonString,
        }}
        rowProps={{
          fullWidth: true,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          mode: 'text',
          width: '100%',
          height: '300px',
          setOptions: editorOptions,
          theme: editorTheme,
          onChange: (e, string, field, form) => {
            form.setFieldValue(field.name, string);
          },
          onBlur: (e, field, form) => {
            form.setFieldTouched(field.name, true);
          },
        }}
      />
    </div>
  );
}

function UserAttributes({ values: { _attributes, _isComplexUserAttributes } }) {
  const { onSwitchChange } = useContext(Context);

  return (
    <>
      <SubHeader title={<h4>{userAttributesText}</h4>} />
      <FormikSwitch
        formRow
        elementProps={{
          label: complexAttributesText,
          checked: _isComplexUserAttributes,
          onChange: onSwitchChange,
        }}
        name="_isComplexUserAttributes"
      />

      {_isComplexUserAttributes === true ? (
        <ComplexUserAttributes />
      ) : (
        <SimpleUserAttributes attributes={_attributes} />
      )}
    </>
  );
}

UserAttributes.propTypes = {
  values: PropTypes.object.isRequired,
};

export default UserAttributes;
