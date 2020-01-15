import React, { Fragment, useContext } from 'react';
import PropTypes from 'prop-types';
import { connect as connectFormik } from 'formik';
import { get } from 'lodash';
import { EuiSpacer } from '@elastic/eui';
import { FormikCodeEditor, FormikFieldText, FormikComboBox } from '../../../../../components';
import ActionChecks from '../ActionChecks';
import {
  fromText,
  iconEmojiText,
  severityText,
  resolvesSeverityText,
} from '../../../../../utils/i18n/watch';
import { nameText, bodyText } from '../../../../../utils/i18n/common';
import { validateEmptyField, isInvalid, hasError } from '../../../../../utils/validate';
import ActionBodyHelpText from '../ActionBodyHelpText';
import ActionBodyPreview from '../ActionBodyPreview';
import ActionThrottlePeriod from '../ActionThrottlePeriod';
import ActionAccount from '../ActionAccount';
import { ACCOUNT_TYPE } from '../../../../Accounts/utils/constants';
import { SEVERITY_OPTIONS, WATCH_TYPES } from '../../../utils/constants';

import { Context } from '../../../../../Context';

const SlackAction = ({ isResolveActions, index, accounts, formik: { values } }) => {
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
  const fromPath = `${actionsRootPath}[${index}].from`;
  const iconEmojiPath = `${actionsRootPath}[${index}].icon_emoji`;
  const textPath = `${actionsRootPath}[${index}].text`;
  const bodyPreviewTemplate = get(values, `${actionsRootPath}[${index}].text`, '');

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
            onCreateOption: onComboBoxCreateOption(),
          }}
        />
      )}
      {!isResolveActions && <ActionThrottlePeriod index={index} />}
      <ActionAccount
        isResolveActions={isResolveActions}
        index={index}
        accounts={accounts}
        accountType={ACCOUNT_TYPE.SLACK}
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
          validate: validateEmptyField,
        }}
      />
      <FormikFieldText
        name={iconEmojiPath}
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
        name={textPath}
        formRow
        rowProps={{
          label: bodyText,
          fullWidth: true,
          isInvalid,
          error: hasError,
          helpText: (isGraphWatch && checksResult)
            ? (<ActionBodyHelpText watchResultData={checksResult} />)
            : null
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
      <ActionBodyPreview index={index} template={bodyPreviewTemplate} />
      {!isGraphWatch && <ActionChecks actionIndex={index} />}
    </Fragment>
  );
};

SlackAction.defaultProps = {
  accounts: [],
  isResolveActions: false,
};

SlackAction.propTypes = {
  isResolveActions: PropTypes.bool,
  index: PropTypes.number.isRequired,
  formik: PropTypes.object.isRequired,
  accounts: PropTypes.array,
};

export default connectFormik(SlackAction);
