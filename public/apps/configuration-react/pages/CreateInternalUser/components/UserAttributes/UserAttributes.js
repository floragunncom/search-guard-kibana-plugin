import React from 'react';
import { FieldArray } from 'formik';
import { FormikFieldText, DynamicValuesForm } from '../../../../components';
import { hasError, isInvalid, validateTextField } from '../../../../utils/validation';
import { userAttributesText } from '../../../../utils/i18n/internal_users';

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
    name="_attributes"
    validateOnChange={false}
    render={arrayHelpers => (
      <DynamicValuesForm
        isKey
        title={userAttributesText}
        onAdd={() => arrayHelpers.push({})}
        onRemove={i => arrayHelpers.remove(i)}
        items={attributes}
        name="_attributes"
        onRenderValueField={renderValueField}
        onRenderKeyField={renderKeyField}
      />
    )}
  />
);

export default UserAttributes;
