import React from 'react';
import { FormikFieldText } from '../../../../../../components';
import { targetText, nameText } from '../../../../../utils/i18n/watch';

const StaticBlock = ({ idx }) => {
  return (
    <>
      <FormikFieldText
        name={`_ui.checksBlocks[${idx}].name`}
        formRow
        rowProps={{
          label: nameText,
        }}
        elementProps={{
          onFocus: (e, field, form) => {
            form.setFieldError(field.name, undefined);
          },
        }}
      />
      <FormikFieldText
        name={`_ui.checksBlocks[${idx}].target`}
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
    </>
  );
};

export default StaticBlock;
