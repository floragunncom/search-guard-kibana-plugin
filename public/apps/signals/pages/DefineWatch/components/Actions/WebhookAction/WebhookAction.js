import React, { Fragment } from 'react';
import chrome from 'ui/chrome';
import PropTypes from 'prop-types';
import { connect as connectFormik } from 'formik';
import { get } from 'lodash';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
} from '@elastic/eui';
import {
  FormikCodeEditor,
  FormikFieldText,
  FormikSelect,
  FormikComboBox,
} from '../../../../../components';
import JsonChecksForm from '../../JsonChecksForm';
import {
  nameText,
  urlText,
  bodyText,
  headersText,
  methodText
} from '../../../../../utils/i18n/common';
import {
  severityText,
  resolvesSeverityText,
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
import { SEVERITY_OPTIONS, WATCH_TYPES } from '../../../utils/constants';

const IS_DARK_THEME = chrome.getUiSettingsClient().get('theme:darkMode');
let { theme, darkTheme, ...setOptions } = CODE_EDITOR;
theme = !IS_DARK_THEME ? theme : darkTheme;

const WebhookAction = ({
  isResolveActions,
  formik: { values },
  index,
  onComboBoxChange,
  onComboBoxOnBlur,
  onComboBoxCreateOption,
}) => {
  const watchType = get(values, '_ui.watchType');
  const isGraphWatch = watchType === WATCH_TYPES.GRAPH;
  const isSeverity = get(values, '_ui.isSeverity', false);

  const severityLabel = isResolveActions ? resolvesSeverityText : severityText;
  const severityPath = isResolveActions
    ? `resolve_actions[${index}].resolves_severity`
    : `actions[${index}].severity`;

  const actionsRootPath = isResolveActions ? 'resolve_actions' : 'actions';
  const namePath = `${actionsRootPath}[${index}].name`;
  const requestMethodPath = `${actionsRootPath}[${index}].request.method`;
  const requestUrlPath = `${actionsRootPath}[${index}].request.url`;
  const requestHeadersPath = `${actionsRootPath}[${index}].request.headers`;
  const requestBodyPath = `${actionsRootPath}[${index}].request.body`;
  const requestBodyPreviewTemplate = get(values, `${actionsRootPath}[${index}].request.body`, '');
  const checksPath = `${actionsRootPath}[${index}].checks`;

  return (
    <Fragment>
      <EuiFlexGroup className="sg-group" justifyContent="spaceBetween">
        <EuiFlexItem className="sg-item">
          <FormikFieldText
            name={namePath}
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
          {isSeverity && <FormikComboBox
            name={severityPath}
            formRow
            rowProps={{
              label: severityLabel,
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
          />}
          {!isResolveActions && <ActionThrottlePeriod index={index} />}
          <FormikSelect
            name={requestMethodPath}
            formRow
            rowProps={{
              label: methodText,
            }}
            elementProps={{
              options: METHOD_SELECT,
            }}
          />
          <FormikFieldText
            name={requestUrlPath}
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
            name={requestHeadersPath}
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
        name={requestBodyPath}
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
      <ActionBodyPreview index={index} template={requestBodyPreviewTemplate} />
      {!isGraphWatch && <JsonChecksForm checksPath={checksPath} />}
    </Fragment>
  );
};

WebhookAction.defaultProps = {
  isLoading: false,
  isResolveActions: false
};

WebhookAction.propTypes = {
  isLoading: PropTypes.bool,
  isResolveActions: PropTypes.bool,
  formik: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onChecksChange: PropTypes.func,
  onAddCheckTemplate: PropTypes.func,
  onExecuteChecks: PropTypes.func,
  onTriggerFlyout: PropTypes.func,
  insertCheckTemplate: PropTypes.shape({
    row: PropTypes.number,
    column: PropTypes.column,
    text: PropTypes.string,
  }),
};

export default connectFormik(WebhookAction);
