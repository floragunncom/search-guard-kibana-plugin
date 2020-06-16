/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import { FormikFieldText } from '../../../../../components';
import { targetText } from '../../../../../utils/i18n/watch';

export function CheckTarget({ targetPath }) {
  return (
    <FormikFieldText
      name={targetPath}
      formRow
      rowProps={{
        label: targetText,
      }}
      elementProps={{
        onFocus: (e, field, form) => {
          form.setFieldError(field.name, undefined);
        },
      }}
    />
  );
}
