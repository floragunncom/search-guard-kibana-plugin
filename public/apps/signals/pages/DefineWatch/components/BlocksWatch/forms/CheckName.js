/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import { FormikFieldText } from '../../../../../components';
import { isInvalid, hasError, validateEmptyField } from '../../../utils/validate';
import { nameText } from '../../../../../utils/i18n/watch';

export function CheckName({ namePath }) {
  return (
    <FormikFieldText
      name={namePath}
      formRow
      rowProps={{
        label: nameText,
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        isInvalid,
        onFocus: (e, field, form) => {
          form.setFieldError(field.name, undefined);
        },
      }}
      formikFieldProps={{
        validate: validateEmptyField,
      }}
    />
  );
}
