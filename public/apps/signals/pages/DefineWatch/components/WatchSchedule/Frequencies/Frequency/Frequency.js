import React from 'react';
import { FormikSelect } from '../../../../../../components';
import { isInvalid, hasError } from '../../../../../../utils/validate';
import { modeText } from '../../../../../../utils/i18n/watch';
import { FREQUENCIES } from './utils/constants';

const Frequency = () => (
  <FormikSelect
    name="_ui.frequency"
    formRow
    rowProps={{
      label: modeText,
      isInvalid,
      error: hasError,
    }}
    elementProps={{
      options: FREQUENCIES,
      isInvalid,
    }}
  />
);

export default Frequency;
