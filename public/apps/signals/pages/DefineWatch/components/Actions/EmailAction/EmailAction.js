import React, { Fragment } from 'react';
import chrome from 'ui/chrome';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { isEmpty, get } from 'lodash';
import { EuiSpacer } from '@elastic/eui';
import { FormikCodeEditor, FormikFieldText, FormikComboBox } from '../../../../../components';
import { getCurrentAccount } from '../utils';
import { nameText, bodyText } from '../../../../../utils/i18n/common';
import ActionChecks from '../ActionChecks';
import {
  fromText,
  toText,
  subjectText,
  ccText,
  bccText,
  severityText,
  resolvesSeverityText,
} from '../../../../../utils/i18n/watch';
import {
  validateEmailAddr,
  validateEmptyField,
  isInvalid,
  hasError,
} from '../../../../../utils/validate';
import ActionBodyPreview from '../ActionBodyPreview';
import ActionThrottlePeriod from '../ActionThrottlePeriod';
import ActionAccount from '../ActionAccount';
import { SEVERITY_OPTIONS, WATCH_TYPES } from '../../../utils/constants';
import { ACCOUNT_TYPE } from '../../../../Accounts/utils/constants';
import { CODE_EDITOR } from '../../../../../../utils/constants';

const IS_DARK_THEME = chrome.getUiSettingsClient().get('theme:darkMode');
const { darkTheme, ...setOptions } = CODE_EDITOR;
let { theme } = CODE_EDITOR;
theme = !IS_DARK_THEME ? theme : darkTheme;

const EmailAction = ({
  httpClient,
  onTriggerFlyout,
  isResolveActions,
  index,
  accounts,
  formik: { values },
  onComboBoxChange,
  onComboBoxOnBlur,
  onComboBoxCreateOption,
}) => {
  const watchType = get(values, '_ui.watchType');
  const isGraphWatch = watchType === WATCH_TYPES.GRAPH;
  const actionsRootPath = isResolveActions ? 'resolve_actions' : 'actions';
  const currAccount = getCurrentAccount(accounts, get(values, `${actionsRootPath}[${index}].account`));
  const isDefaultFrom = !!currAccount && !isEmpty(currAccount.default_from);
  const isDefaultTo = !!currAccount && !isEmpty(currAccount.default_to);
  const isSeverity = get(values, '_ui.isSeverity', false);

  const severityLabel = isResolveActions ? resolvesSeverityText : severityText;
  const severityPath = isResolveActions
    ? `resolve_actions[${index}].resolves_severity`
    : `actions[${index}].severity`;

  const namePath = `${actionsRootPath}[${index}].name`;
  const fromPath = `${actionsRootPath}[${index}].from`;
  const toPath = `${actionsRootPath}[${index}].to`;
  const ccPath = `${actionsRootPath}[${index}].cc`;
  const bccPath = `${actionsRootPath}[${index}].bcc`;
  const subjectPath = `${actionsRootPath}[${index}].subject`;
  const textBodyPath = `${actionsRootPath}[${index}].text_body`;
  const bodyPreviewTemplate = get(values, `${actionsRootPath}[${index}].text_body`, '');

  return (
    <Fragment>
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
      <ActionAccount
        isResolveActions={isResolveActions}
        index={index}
        accounts={accounts}
        accountType={ACCOUNT_TYPE.EMAIL}
      />
      <FormikFieldText
        name={fromPath}
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
          validate: !isDefaultFrom ? validateEmailAddr() : null,
        }}
      />
      <FormikComboBox
        name={toPath}
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
          validate: !isDefaultTo ? validateEmailAddr() : null,
        }}
      />
      <FormikComboBox
        name={ccPath}
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
          validate: validateEmailAddr(false),
        }}
      />
      <FormikComboBox
        name={bccPath}
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
          validate: validateEmailAddr(false),
        }}
      />
      <FormikFieldText
        name={subjectPath}
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
          validate: validateEmptyField,
        }}
      />
      <EuiSpacer />
      <FormikCodeEditor
        name={textBodyPath}
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
          validate: validateEmptyField,
        }}
      />
      <ActionBodyPreview index={index} template={bodyPreviewTemplate} />
      {!isGraphWatch && (
        <ActionChecks
          actionIndex={index}
          httpClient={httpClient}
          onTriggerFlyout={onTriggerFlyout}
        />
      )}
    </Fragment>
  );
};

EmailAction.defaultProps = {
  accounts: [],
  isResolveActions: false,
};

EmailAction.propTypes = {
  httpClient: PropTypes.func.isRequired,
  isResolveActions: PropTypes.bool,
  index: PropTypes.number.isRequired,
  formik: PropTypes.object.isRequired,
  accounts: PropTypes.array,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onTriggerFlyout: PropTypes.func.isRequired,
};

export default connectFormik(EmailAction);
