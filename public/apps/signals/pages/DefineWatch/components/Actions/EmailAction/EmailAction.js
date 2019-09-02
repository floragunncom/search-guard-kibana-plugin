import React, { Fragment } from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { EuiSpacer } from '@elastic/eui';
import {
  FormikCodeEditor,
  FormikFieldText,
  FormikComboBox
} from '../../../../../components';
import {
  nameText,
  bodyText
} from '../../../../../utils/i18n/common';
import {
  fromText,
  toText,
  subjectText
} from '../../../../../utils/i18n/watch';
import {
  validateEmptyField,
  validateEmptyArray,
  isInvalid,
  hasError
} from '../../../../../utils/validate';
import ActionBodyPreview from '../ActionBodyPreview';
import ActionThrottlePeriod from '../ActionThrottlePeriod';
import ActionDestination from '../ActionDestination';

const EmailAction = ({
  index,
  httpClient,
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
    <ActionThrottlePeriod index={index} />
    <ActionDestination index={index} httpClient={httpClient} />
    <FormikFieldText
      name={`actions[${index}].from`}
      formRow
      rowProps={{
        label: fromText,
      }}
      elementProps={{
        onFocus: (e, field, form) => {
          form.setFieldError(field.name, undefined);
        },
      }}
    />
    <FormikComboBox
      name={`actions[${index}.to`}
      formRow
      formikFieldProps={{ validate: validateEmptyArray }}
      rowProps={{
        label: toText,
        isInvalid,
        error: hasError,
        style: { paddingLeft: '0px' },
      }}
      elementProps={{
        isClearable: true,
        placeholder: 'Type email addresses',
        options: actions[index].to,
        onBlur: onComboBoxOnBlur,
        onChange: onComboBoxChange(),
        onCreateOption: onComboBoxCreateOption()
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
          tabSize: 2,
          useSoftTabs: true,
          maxLines: 10,
          minLines: 10
        },
        mode: 'text',
        width: '100%',
        theme: 'github',
        onChange: (text, field, form) => {
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

EmailAction.propTypes = {
  index: PropTypes.number.isRequired,
  httpClient: PropTypes.func.isRequired,
  formik: PropTypes.object.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired
};

export default connectFormik(EmailAction);
