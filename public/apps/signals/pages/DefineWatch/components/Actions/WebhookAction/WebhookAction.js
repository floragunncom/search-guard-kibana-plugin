import React, { Fragment } from 'react';
import chrome from 'ui/chrome';
import PropTypes from 'prop-types';
import { EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import {
  FormikCodeEditor,
  FormikFieldText,
  FormikSelect,
  FormikComboBox
} from '../../../../../components';
import {
  nameText,
  urlText,
  bodyText,
  headersText,
  methodText
} from '../../../../../utils/i18n/common';
import {
  severityText
} from '../../../../../utils/i18n/watch';
import ActionBodyPreview from '../ActionBodyPreview';
import ActionThrottlePeriod from '../ActionThrottlePeriod';
import {
  hasError,
  isInvalid,
  validateEmptyField,
  validateJsonString
} from '../../../../../utils/validate';
import { METHOD_SELECT } from './utils/constants';
import { CODE_EDITOR } from '../../../../../../utils/constants';
import { SEVERITY_OPTIONS } from '../../../utils/constants';

const IS_DARK_THEME = chrome.getUiSettingsClient().get('theme:darkMode');
let { theme, darkTheme, ...setOptions } = CODE_EDITOR;
theme = !IS_DARK_THEME ? theme : darkTheme;

const WebhookAction = ({
  index,
  onComboBoxChange,
  onComboBoxOnBlur,
  onComboBoxCreateOption
}) => (
  <Fragment>
    <EuiFlexGroup className="sg-group" justifyContent="spaceBetween">
      <EuiFlexItem className="sg-item">
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
        <FormikSelect
          name={`actions[${index}].request.method`}
          formRow
          rowProps={{
            label: methodText,
          }}
          elementProps={{
            options: METHOD_SELECT,
          }}
        />
        <FormikFieldText
          name={`actions[${index}].request.url`}
          formRow
          rowProps={{
            label: urlText,
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
      </EuiFlexItem>
      <EuiFlexItem className="sg-item">
        <FormikCodeEditor
          name={`actions[${index}].request.headers`}
          formRow
          rowProps={{
            label: headersText,
            isInvalid,
            error: hasError
          }}
          elementProps={{
            isInvalid,
            setOptions: {
              ...setOptions,
              maxLines: 10,
              minLines: 10
            },
            mode: 'text',
            theme,
            onChange: (e, text, field, form) => {
              form.setFieldValue(field.name, text);
            },
            onBlur: (e, field, form) => {
              form.setFieldTouched(field.name, true);
            },
          }}
          formikFieldProps={{
            validate: validateJsonString
          }}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiSpacer />
    <FormikCodeEditor
      name={`actions[${index}].request.body`}
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
    <ActionBodyPreview index={index} />
  </Fragment>
);

WebhookAction.propTypes = {
  index: PropTypes.number.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired
};

export default WebhookAction;
