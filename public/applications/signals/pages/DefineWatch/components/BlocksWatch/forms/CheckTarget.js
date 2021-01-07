/* eslint-disable @kbn/eslint/require-license-header */
import React from 'react';
import { FormikFieldText } from '../../../../../components';
import { targetText, watchCheckInputTargetHelpText } from '../../../../../utils/i18n/watch';

export function CheckTarget({ targetPath }) {
  return (
    <FormikFieldText
      name={targetPath}
      formRow
      rowProps={{
        label: targetText,
        helpText: watchCheckInputTargetHelpText,
      }}
      elementProps={{
        onFocus: (e, field, form) => {
          form.setFieldError(field.name, undefined);
        },
      }}
    />
  );
}
