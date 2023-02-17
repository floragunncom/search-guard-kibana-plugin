/* eslint-disable @osd/eslint/require-license-header */
import React from 'react';
import { FormikFieldText } from '../../../../../components';
import { targetText, optionalText } from '../../../../../utils/i18n/watch';

export function CheckTarget({ targetPath }) {
  return (
    <FormikFieldText
      name={targetPath}
      formRow
      rowProps={{
        label: targetText,
        helpText: optionalText,
      }}
      elementProps={{
        onFocus: (e, field, form) => {
          form.setFieldError(field.name, undefined);
        },
      }}
    />
  );
}
