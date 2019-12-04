import React, { Fragment } from 'react';
import chrome from 'ui/chrome';
import PropTypes from 'prop-types';
import { connect as connectFormik } from 'formik';
import { EuiSpacer } from '@elastic/eui';
import {
  FormikCodeEditor,
  FormikFieldText,
  FormikComboBox
} from '../../../../../components';
import {
  fromText,
  iconEmojiText,
  severityText
} from '../../../../../utils/i18n/watch';
import {
  nameText,
  bodyText,
} from '../../../../../utils/i18n/common';
import {
  validateEmptyField,
  isInvalid,
  hasError
} from '../../../../../utils/validate';
import ActionBodyPreview from '../ActionBodyPreview';
import ActionThrottlePeriod from '../ActionThrottlePeriod';
import ActionAccount from '../ActionAccount';
import { ACCOUNT_TYPE } from '../../../../Accounts/utils/constants';
import { CODE_EDITOR } from '../../../../../../utils/constants';
import { SEVERITY_OPTIONS } from '../../../utils/constants';

const IS_DARK_THEME = chrome.getUiSettingsClient().get('theme:darkMode');
let { theme, darkTheme, ...setOptions } = CODE_EDITOR;
theme = !IS_DARK_THEME ? theme : darkTheme;

const SlackAction = ({
  index,
  accounts,
  formik: { values: { actions } },
  onComboBoxChange,
  onComboBoxOnBlur,
  onComboBoxCreateOption
}) => (
  <Fragment>
    <FormikFieldText
      name={`actions[${index}].name`}
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
        validate: validateEmptyField
      }}
    />
    <FormikComboBox
      name={`actions[${index}].severity`}
      formRow
      rowProps={{
        label: severityText,
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        options: SEVERITY_OPTIONS,
        isClearable: true,
        placeholder: 'Select severity',
        onBlur: onComboBoxOnBlur,
        onChange: onComboBoxChange(),
        onCreateOption: onComboBoxCreateOption()
      }}
    />
    <ActionThrottlePeriod index={index} />
    <ActionAccount
      index={index}
      accounts={accounts}
      accountType={ACCOUNT_TYPE.SLACK}
    />
    <FormikFieldText
      name={`actions[${index}].from`}
      formRow
      rowProps={{
        label: fromText,
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
        validate: validateEmptyField
      }}
    />
    <FormikFieldText
      name={`actions[${index}].icon_emoji`}
      formRow
      rowProps={{
        label: iconEmojiText,
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        isInvalid,
        onFocus: (e, field, form) => {
          form.setFieldError(field.name, undefined);
        },
      }}
    />
    <EuiSpacer />
    <FormikCodeEditor
      name={`actions[${index}].text`}
      formRow
      rowProps={{
        label: bodyText,
        fullWidth: true,
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        isInvalid,
        setOptions: {
          ...setOptions,
          maxLines: 10,
          minLines: 10
        },
        mode: 'text',
        width: '100%',
        theme,
        onChange: (e, text, field, form) => {
          form.setFieldValue(field.name, text);
        },
        onBlur: (e, field, form) => {
          form.setFieldTouched(field.name, true);
        },
      }}
      formikFieldProps={{
        validate: validateEmptyField
      }}
    />
    <ActionBodyPreview index={index} template={actions[index].text} />
  </Fragment>
);

SlackAction.defaultProps = {
  accounts: []
};

SlackAction.propTypes = {
  index: PropTypes.number.isRequired,
  formik: PropTypes.object.isRequired,
  accounts: PropTypes.array,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired
};

export default connectFormik(SlackAction);
