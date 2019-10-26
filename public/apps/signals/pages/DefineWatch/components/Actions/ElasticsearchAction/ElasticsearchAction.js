import React, { Fragment } from 'react';
import chrome from 'ui/chrome';
import PropTypes from 'prop-types';
import {
  FormikCodeEditor,
  FormikFieldText,
} from '../../../../../components';
import {
  nameText
} from '../../../../../utils/i18n/common';
import WatchIndex from '../../WatchIndex';
import {
  validateWatchString,
  validateEmptyField,
  isInvalid,
  hasError
} from '../../../../../utils/validate';
import ActionThrottlePeriod from '../ActionThrottlePeriod';
import { CODE_EDITOR } from '../../../../../../utils/constants';

const IS_DARK_THEME = chrome.getUiSettingsClient().get('theme:darkMode');
let { theme, darkTheme, ...setOptions } = CODE_EDITOR;
theme = !IS_DARK_THEME ? theme : darkTheme;

const ElasticsearchAction = ({
  index,
  httpClient,
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
      name={`actions[${index}].checks`}
      formRow
      rowProps={{
        label: 'Checks',
        fullWidth: true,
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        isUseWorker: false,
        isInvalid,
        setOptions,
        mode: 'text',
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

ElasticsearchAction.propTypes = {
  index: PropTypes.number.isRequired,
  httpClient: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired
};

export default ElasticsearchAction;
