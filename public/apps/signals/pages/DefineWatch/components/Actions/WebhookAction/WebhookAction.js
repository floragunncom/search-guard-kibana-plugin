import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import {
  FormikCodeEditor,
  FormikFieldText,
  FormikSelect
} from '../../../../../components';
import {
  nameText,
  urlText,
  bodyText,
  headersText,
  methodText
} from '../../../../../utils/i18n/common';
import ActionBodyPreview from '../ActionBodyPreview';
import ActionThrottlePeriod from '../ActionThrottlePeriod';
import {
  hasError,
  isInvalid,
  validateEmptyField,
  validateJsonString
} from '../../../../../utils/validate';
import { METHOD_SELECT } from './utils/constants';

const WebhookAction = ({ index }) => (
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
              tabSize: 2,
              useSoftTabs: true,
              maxLines: 10,
              minLines: 10
            },
            mode: 'text',
            theme: 'github',
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
          tabSize: 2,
          useSoftTabs: true,
          maxLines: 10,
          minLines: 10
        },
        mode: 'text',
        width: '100%',
        theme: 'github',
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
  index: PropTypes.number.isRequired
};

export default WebhookAction;
