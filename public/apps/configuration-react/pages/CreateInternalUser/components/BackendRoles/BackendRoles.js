import React from 'react';
import { FieldArray } from 'formik';
import { FormikFieldText, DynamicValuesForm } from '../../../../components';
import { hasError, isInvalid, validateTextField } from '../../../../utils/validation';
import { i18nBackendRolesText } from '../../../../utils/i18n_nodes';

const handleRenderValueField = fieldName => (
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

const BackendRoles = ({ roles }) => (
  <FieldArray
    name="roles"
    validateOnChange={false}
    render={arrayHelpers => (
      <DynamicValuesForm
        title={i18nBackendRolesText}
        onAdd={() => arrayHelpers.push({})}
        onRemove={i => arrayHelpers.remove(i)}
        items={roles}
        name="roles"
        onRenderValueField={handleRenderValueField}
      />
    )}
  />
);

export default BackendRoles;
