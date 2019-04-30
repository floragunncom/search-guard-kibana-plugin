import React from 'react';
import { FieldArray } from 'formik';
import { FormikFieldText, DynamicValuesForm } from '../../../../components';
import { hasError, isInvalid, validateTextField } from '../../../../utils/validation';
import { i18nUserAttributesText } from '../../../../utils/i18n_nodes';

const renderValueField = fieldName => (
  <FormikFieldText
    formRow
    formikFieldProps={{
      validate: validateTextField
    }}
    rowProps={{
      isInvalid,
      error: hasError
    }}
    elementProps={{
      isInvalid
    }}
    name={fieldName}
  />
);

const renderKeyField = fieldName => (
  <FormikFieldText
    formRow
    formikFieldProps={{
      validate: validateTextField
    }}
    rowProps={{
      isInvalid,
      error: hasError
    }}
    elementProps={{
      isInvalid
    }}
    name={fieldName}
  />
);

const UserAttributes = ({ attributes }) => (
  <FieldArray
    name="attributes"
    validateOnChange={false}
    render={arrayHelpers => (
      <DynamicValuesForm
        isKey
        title={i18nUserAttributesText}
        onAdd={() => arrayHelpers.push({})}
        onRemove={i => arrayHelpers.remove(i)}
        items={attributes}
        name="attributes"
        onRenderValueField={renderValueField}
        onRenderKeyField={renderKeyField}
      />
    )}
  />
);

export default UserAttributes;
