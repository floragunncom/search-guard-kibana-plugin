import React, { Fragment, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect as connectFormik } from 'formik';
import { get } from 'lodash';
import { EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';

// Signl4-specific: Header name for API key authentication
const API_KEY_HEADER_NAME = 'X-S4-Api-Key';
// URL patterns that trigger the API Key field display (currently only Signl4)
const CUSTOM_FIELD_URL_PATTERNS = ['signl4.com'];

const shouldShowCustomField = (url) => {
  return CUSTOM_FIELD_URL_PATTERNS.some((pattern) => url.includes(pattern));
};
import {
  FormikCodeEditor,
  FormikFieldText,
  FormikSelect,
  FormikComboBox, FormikCodeEditorSG,
} from '../../../../../components';
import {
  nameText,
  urlText,
  bodyText,
  headersText,
  methodText,
} from '../../../../../utils/i18n/common';
import { severityText, resolvesSeverityText } from '../../../../../utils/i18n/watch';
import { RowHelpTextMustacheRuntimeDataField } from '../../RowHelpText';
import ActionBodyPreview from '../ActionBodyPreview';
import ActionThrottlePeriod from '../ActionThrottlePeriod';
import {
  hasError,
  isInvalid,
  validateEmptyField,
  validateJsonString,
} from '../../../../../utils/validate';
import ActionChecks from '../ActionChecks';
import { METHOD_SELECT } from './utils/constants';
import { SEVERITY_OPTIONS, WATCH_TYPES } from '../../../utils/constants';

import { Context } from '../../../../../Context';

const WebhookAction = ({ isResolveActions, formik: { values }, index }) => {
  const {
    editorTheme,
    editorOptions,
    onComboBoxChange,
    onComboBoxCreateOption,
    onComboBoxOnBlur,
  } = useContext(Context);

  const watchType = get(values, '_ui.watchType');
  const isGraphWatch = watchType === WATCH_TYPES.GRAPH;
  const isSeverity = get(values, '_ui.isSeverity', false);
  const checksResult = get(values, '_ui.checksResult', null);

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

  // State for showing API Key field when URL matches Signl4 patterns
  const [showCustomField, setShowCustomField] = useState(() =>
    shouldShowCustomField(get(values, requestUrlPath, ''))
  );

  // Update showCustomField when URL changes
  useEffect(() => {
    const currentUrl = get(values, requestUrlPath, '');
    setShowCustomField(shouldShowCustomField(currentUrl));
  }, [get(values, requestUrlPath)]);

  return (
    <Fragment>
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem>
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
              validate: validateEmptyField,
            }}
          />
          {isSeverity && (
            <FormikComboBox
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
            />
          )}
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
              onBlur: (e, field) => {
                setShowCustomField(shouldShowCustomField(field.value || ''));
              },
            }}
            formikFieldProps={{
              validate: validateEmptyField,
            }}
          />
          {showCustomField && (
            <FormikFieldText
              name={`${actionsRootPath}[${index}]._account`}
              formRow
              rowProps={{
                label: 'API Key',
                isInvalid,
                error: hasError,
              }}
              elementProps={{
                isInvalid,
                placeholder: 'Enter API key',
                onChange: (e, field, form) => {
                  field.onChange(e);
                  // Sync API key to headers
                  const accountValue = e.target.value || '';
                  const currentHeaders = get(values, requestHeadersPath, '{}');
                  try {
                    const headersObj = JSON.parse(currentHeaders);
                    headersObj[API_KEY_HEADER_NAME] = accountValue;
                    form.setFieldValue(requestHeadersPath, JSON.stringify(headersObj, null, 2));
                  } catch (error) {
                    // Headers JSON invalid - skip sync
                  }
                },
              }}
            />
          )}
        </EuiFlexItem>
        <EuiFlexItem>
          <FormikCodeEditorSG
            name={requestHeadersPath}
            formRow
            rowProps={{
              label: headersText,
              isInvalid,
              error: hasError,
            }}
            elementProps={{
              isInvalid,
              setOptions: {
                ...editorOptions,
                maxLines: 10,
                minLines: 10,
              },
              mode: 'json',
              theme: editorTheme,
              onChange: (e, text, field, form) => {
                form.setFieldValue(field.name, text);
                // Sync API key from headers to _account field
                if (showCustomField) {
                  try {
                    const headersObj = JSON.parse(text);
                    const apiKey = headersObj[API_KEY_HEADER_NAME] || '';
                    form.setFieldValue(`${actionsRootPath}[${index}]._account`, apiKey);
                  } catch (error) {
                    // Invalid JSON, ignore sync
                  }
                }
              },
              onBlur: (e, field, form) => {
                form.setFieldTouched(field.name, true);
              },
            }}
            formikFieldProps={{
              validate: validateJsonString,
            }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="m" />
      <FormikCodeEditorSG
        name={requestBodyPath}
        formRow
        rowProps={{
          label: bodyText,
          fullWidth: true,
          isInvalid,
          error: hasError,
          helpText: <RowHelpTextMustacheRuntimeDataField />,
        }}
        elementProps={{
          isInvalid,
          setOptions: {
            ...editorOptions,
            maxLines: 10,
            minLines: 10,
          },
          mode: 'text',
          width: '100%',
          theme: editorTheme,
          onChange: (e, text, field, form) => {
            form.setFieldValue(field.name, text);
          },
          onBlur: (e, field, form) => {
            form.setFieldTouched(field.name, true);
          },
        }}
        formikFieldProps={{
          validate: validateEmptyField,
        }}
      />
      <ActionBodyPreview index={index} template={requestBodyPreviewTemplate} />

      <EuiSpacer />
      {!isGraphWatch && <ActionChecks actionIndex={index} isResolveActions={isResolveActions} />}
    </Fragment>
  );
};

WebhookAction.defaultProps = {
  isLoading: false,
  isResolveActions: false,
};

WebhookAction.propTypes = {
  isLoading: PropTypes.bool,
  isResolveActions: PropTypes.bool,
  formik: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

export default connectFormik(WebhookAction);
