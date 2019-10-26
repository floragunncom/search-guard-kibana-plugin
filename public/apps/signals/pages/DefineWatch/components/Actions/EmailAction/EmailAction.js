import React, { Fragment } from 'react';
import chrome from 'ui/chrome';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { EuiSpacer } from '@elastic/eui';
import {
  FormikCodeEditor,
  FormikFieldText,
  FormikComboBox
} from '../../../../../components';
import { getCurrentAccount } from '../utils';
import {
  nameText,
  bodyText
} from '../../../../../utils/i18n/common';
import {
  fromText,
  toText,
  subjectText,
  ccText,
  bccText
} from '../../../../../utils/i18n/watch';
import {
  validateEmailAddr,
  validateEmptyField,
  isInvalid,
  hasError
} from '../../../../../utils/validate';
import ActionBodyPreview from '../ActionBodyPreview';
import ActionThrottlePeriod from '../ActionThrottlePeriod';
import ActionDestination from '../ActionDestination';
import { DESTINATION_TYPE } from '../../../../Destinations/utils/constants';
import { CODE_EDITOR } from '../../../../../../utils/constants';

const IS_DARK_THEME = chrome.getUiSettingsClient().get('theme:darkMode');
let { theme, darkTheme, ...setOptions } = CODE_EDITOR;
theme = !IS_DARK_THEME ? theme : darkTheme;

const EmailAction = ({
  index,
  destinations,
  formik: { values: { actions } },
  onComboBoxChange,
  onComboBoxOnBlur,
  onComboBoxCreateOption
}) => {
  const currDestination = getCurrentAccount(destinations, actions[index].account);
  const isDefaultFrom = !!currDestination && !isEmpty(currDestination.default_from);
  const isDefaultTo = !!currDestination && !isEmpty(currDestination.default_to);

  return (
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
      <ActionThrottlePeriod index={index} />
      <ActionDestination
        index={index}
        destinations={destinations}
        destinationType={DESTINATION_TYPE.EMAIL}
      />
      <FormikFieldText
        name={`actions[${index}].from`}
        formRow
        rowProps={{
          label: fromText,
          isInvalid,
          error: hasError
        }}
        elementProps={{
          isInvalid,
          onFocus: (e, field, form) => {
            form.setFieldError(field.name, undefined);
          },
        }}
        formikFieldProps={{
          validate: !isDefaultFrom ? validateEmailAddr() : null
        }}
      />
      <FormikComboBox
        name={`actions[${index}].to`}
        formRow
        rowProps={{
          label: toText,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          isClearable: true,
          placeholder: 'Type email addresses',
          onBlur: onComboBoxOnBlur,
          onChange: onComboBoxChange(),
          onCreateOption: onComboBoxCreateOption()
        }}
        formikFieldProps={{
          validate: !isDefaultTo ? validateEmailAddr() : null
        }}
      />
      <FormikComboBox
        name={`actions[${index}].cc`}
        formRow
        rowProps={{
          label: ccText,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          isClearable: true,
          placeholder: 'Type email addresses',
          onBlur: onComboBoxOnBlur,
          onChange: onComboBoxChange(),
          onCreateOption: onComboBoxCreateOption()
        }}
        formikFieldProps={{
          validate: validateEmailAddr(false)
        }}
      />
      <FormikComboBox
        name={`actions[${index}].bcc`}
        formRow
        rowProps={{
          label: bccText,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          isClearable: true,
          placeholder: 'Type email addresses',
          onBlur: onComboBoxOnBlur,
          onChange: onComboBoxChange(),
          onCreateOption: onComboBoxCreateOption()
        }}
        formikFieldProps={{
          validate: validateEmailAddr(false)
        }}
      />
      <FormikFieldText
        name={`actions[${index}].subject`}
        formRow
        rowProps={{
          label: subjectText,
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
      <EuiSpacer />
      <FormikCodeEditor
        name={`actions[${index}].text_body`}
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
      <ActionBodyPreview index={index} template={actions[index].text_body} />
    </Fragment>
  );
};

EmailAction.defaultProps = {
  destinations: []
};

EmailAction.propTypes = {
  index: PropTypes.number.isRequired,
  formik: PropTypes.object.isRequired,
  destinations: PropTypes.array,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired
};

export default connectFormik(EmailAction);
