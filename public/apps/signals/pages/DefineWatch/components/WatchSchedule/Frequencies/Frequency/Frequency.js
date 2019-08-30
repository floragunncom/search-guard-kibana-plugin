import React from 'react';
import { FormikSelect } from '../../../../../../components';
import { isInvalid, hasError } from '../../../../../../utils/validate';
import { modeText } from '../../../../../../utils/i18n/watch';
import { FREQUENCIES } from './utils/constants';

const Frequency = () => (
  <FormikSelect
    name="_frequency"
    formRow
    rowProps={{
      label: modeText,
      style: { paddingLeft: '10px' },
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
