import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { connect as connectFormik } from 'formik';
import { get } from 'lodash';
import { EuiSpacer } from '@elastic/eui';
import {
  FormikCodeEditor,
  FormikFieldText,
  FormikComboBox,
  SubHeader,
} from '../../../../../components';
import ActionChecks from '../ActionChecks';
import { validateEmptyField, isInvalid, hasError } from '../../../../../utils/validate';
import { RowHelpTextMustacheRuntimeDataField } from '../../RowHelpText';
import ActionBodyPreview from '../ActionBodyPreview';
import ActionThrottlePeriod from '../ActionThrottlePeriod';
import ActionAccount from '../ActionAccount';
import { ACCOUNT_TYPE } from '../../../../Accounts/utils/constants';
import { nameText } from '../../../../../utils/i18n/common';
import {
  severityText,
  resolvesSeverityText,
  summaryText,
  eventText,
  sourceText,
  customDetailsText,
  dedupKeyText,
} from '../../../../../utils/i18n/watch';
import { SEVERITY_OPTIONS, WATCH_TYPES } from '../../../utils/constants';

import { Context } from '../../../../../Context';

const renderTextField = (path, label, validate) => {
  const formikProps = {};

  if (typeof validate === 'function') {
    formikProps.validate = validate;
  }

  return (
    <FormikFieldText
      name={path}
      formRow
      rowProps={{
        label,
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        isInvalid,
        onFocus: (e, field, form) => {
          form.setFieldError(field.name, undefined);
        },
      }}
      formikFieldProps={{ ...formikProps }}
    />
  );
};

const renderCodeEditor = (path, label, editorTheme, editorOptions, checksResult, validate) => {
  const formikProps = {};

  if (typeof validate === 'function') {
    formikProps.validate = validate;
  }

  return (
    <FormikCodeEditor
      name={path}
      formRow
      rowProps={{
        label,
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
      formikFieldProps={{ ...formikProps }}
    />
  );
};

const PagerdutyAction = ({ isResolveActions, index, accounts, formik: { values } }) => {
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
  const eventDedupKeyPath = `${actionsRootPath}[${index}].event.dedup_key`;
  const eventPayloadSummaryPath = `${actionsRootPath}[${index}].event.payload.summary`;
  const eventPayloadSourcePath = `${actionsRootPath}[${index}].event.payload.source`;
  const eventPayloadCustomDetailsPath = `${actionsRootPath}[${index}].event.payload.custom_details`;
  const descrPreviewTemplate = get(values, eventPayloadSummaryPath, '');

  return (
    <>
      {renderTextField(namePath, nameText, validateEmptyField)}
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
            onCreateOption: onComboBoxCreateOption(),
          }}
        />
      )}
      {!isResolveActions && <ActionThrottlePeriod index={index} />}
      <ActionAccount
        isResolveActions={isResolveActions}
        index={index}
        accounts={accounts}
        accountType={ACCOUNT_TYPE.PAGERDUTY}
      />

      <EuiSpacer />
      <SubHeader title={<h4>{eventText}</h4>} />
      <EuiSpacer size="s" />
      {renderTextField(eventDedupKeyPath, dedupKeyText)}
      {renderTextField(eventPayloadSourcePath, sourceText, validateEmptyField)}
      {renderCodeEditor(
        eventPayloadCustomDetailsPath,
        customDetailsText,
        editorTheme,
        editorOptions,
        checksResult
      )}
      {renderCodeEditor(
        eventPayloadSummaryPath,
        summaryText,
        editorTheme,
        editorOptions,
        checksResult,
        validateEmptyField,
      )}
      <ActionBodyPreview index={index} template={descrPreviewTemplate} />

      <EuiSpacer />
      {!isGraphWatch && <ActionChecks actionIndex={index} isResolveActions={isResolveActions} />}
    </>
  );
};

PagerdutyAction.defaultProps = {
  accounts: [],
  isResolveActions: false,
};

PagerdutyAction.propTypes = {
  isResolveActions: PropTypes.bool,
  index: PropTypes.number.isRequired,
  formik: PropTypes.object.isRequired,
  accounts: PropTypes.array,
};

export default connectFormik(PagerdutyAction);
