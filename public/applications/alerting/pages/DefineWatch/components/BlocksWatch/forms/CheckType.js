/* eslint-disable @osd/eslint/require-license-header */
import React from 'react';
import { FormikFieldText } from '../../../../../components';
import { typeText } from '../../../../../utils/i18n/watch';

export function CheckType({ typePath }) {
  return (
    <FormikFieldText
      name={typePath}
      formRow
      rowProps={{
        label: typeText,
      }}
      elementProps={{
        readOnly: true,
        onFocus: (e, field, form) => {
          form.setFieldError(field.name, undefined);
        },
      }}
    />
  );
}
