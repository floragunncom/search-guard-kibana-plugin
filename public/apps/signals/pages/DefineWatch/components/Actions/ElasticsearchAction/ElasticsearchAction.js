import React, { Fragment } from 'react';
import chrome from 'ui/chrome';
import { connect as connectFormik } from 'formik';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import {
  FormikCodeEditor,
  FormikFieldText,
  FormikComboBox
} from '../../../../../components';
import {
  nameText
} from '../../../../../utils/i18n/common';
import {
  severityText,
  resolvesSeverityText
} from '../../../../../utils/i18n/watch';
import WatchIndex from '../../WatchIndex';
import {
  validateWatchString,
  validateEmptyField,
  isInvalid,
  hasError
} from '../../../utils/validate';
import ActionThrottlePeriod from '../ActionThrottlePeriod';
import { CODE_EDITOR } from '../../../../../../utils/constants';
import { SEVERITY_OPTIONS } from '../../../utils/constants';

const IS_DARK_THEME = chrome.getUiSettingsClient().get('theme:darkMode');
let { theme, darkTheme, ...setOptions } = CODE_EDITOR;
theme = !IS_DARK_THEME ? theme : darkTheme;

const ElasticsearchAction = ({
  isResolveActions,
  formik: { values },
  index,
  httpClient,
  onComboBoxChange,
  onComboBoxOnBlur,
  onComboBoxCreateOption
}) => {
  const isSeverity = get(values, '_ui.isSeverity', false);

  const severityLabel = isResolveActions ? resolvesSeverityText : severityText;
  const severityPath = isResolveActions
    ? `resolve_actions[${index}].resolves_severity`
    : `actions[${index}].severity`;

  const actionsRootPath = isResolveActions ? 'resolve_actions' : 'actions';
  const namePath = `${actionsRootPath}[${index}].name`;
  const checksPath = `${actionsRootPath}[${index}].checks`;

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
      <ActionThrottlePeriod index={index} />
      <WatchIndex
        isClearable={false}
        httpClient={httpClient}
        indexFieldName={`actions[${index}].index`}
        singleSelection={{ asPlainText: true }}
        onComboBoxChange={onComboBoxChange}
        onComboBoxOnBlur={onComboBoxOnBlur}
        onComboBoxCreateOption={onComboBoxCreateOption}
      />
      <FormikCodeEditor
        name={checksPath}
        formRow
        rowProps={{
          label: 'Checks',
          fullWidth: true,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          isCustomMode: true,
          mode: 'watch_editor',
          isInvalid,
          setOptions: {
            ...setOptions,
            enableLiveAutocompletion: true,
            enableSnippets: true
          },
          width: '100%',
          height: '500px',
          theme,
          onChange: (e, text, field, form) => {
            form.setFieldValue(field.name, text);
          },
          onBlur: (e, field, form) => {
            form.setFieldTouched(field.name, true);
          },
        }}
        formikFieldProps={{
          validate: validateWatchString
        }}
      />
    </Fragment>
  );
};

ElasticsearchAction.defaultProps = {
  isResolveActions: false
};

ElasticsearchAction.propTypes = {
  isResolveActions: PropTypes.bool,
  formik: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  httpClient: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired
};

export default connectFormik(ElasticsearchAction);
