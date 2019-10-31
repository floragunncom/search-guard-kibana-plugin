import React from 'react';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { LabelAppendLink, FormikTextArea } from '../../../../../../components';
import {
  isInvalid,
  hasError,
  validateEmptyField
} from '../../../../../../utils/validate';
import { DOC_LINKS } from '../../../../../../utils/constants';
import { everyText } from '../../../../../../utils/i18n/watch';

const CustomCron = () => (
  <EuiFlexGroup direction="column" className="sg-flex-group">
    <EuiFlexItem className="sg-flex-item">
      <FormikTextArea
        name="_ui.cron"
        formRow
        rowProps={{
          label: everyText,
          labelAppend: <LabelAppendLink href={DOC_LINKS.TRIGGERS.SCHEDULE} name="CronDoc" />,
          isInvalid,
          error: hasError,
        }}
        formikFieldProps={{
          validate: validateEmptyField
        }}
      />
    </EuiFlexItem>
  </EuiFlexGroup>
);

export default CustomCron;
