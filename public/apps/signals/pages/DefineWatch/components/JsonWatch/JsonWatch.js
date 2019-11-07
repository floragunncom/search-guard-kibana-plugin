import React from 'react';
import chrome from 'ui/chrome';
import { connect as connectRedux } from 'react-redux';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import {
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { FormikCodeEditor } from '../../../../components';
import { checksText } from '../../../../utils/i18n/watch';
import { stringifyPretty } from '../../../../utils/helpers';
import { hasError, isInvalid, validateWatchString } from '../../utils/validate';
import WatchResponse from '../WatchResponse';
import { CODE_EDITOR } from '../../../../../utils/constants';

const IS_DARK_THEME = chrome.getUiSettingsClient().get('theme:darkMode');
let { theme, darkTheme, ...setOptions } = CODE_EDITOR;
theme = !IS_DARK_THEME ? theme : darkTheme;

const JsonWatch = ({
  formik: {
    values: {
      _ui: { checksResult = null }
    },
    setFieldValue,
  },
  insertCheckTemplate,
  onChange,
}) => {
  const response = !isEmpty(checksResult) ? stringifyPretty(checksResult) : null;

  const renderChecksEditor = () => (
    <FormikCodeEditor
      name="checks"
      formRow
      rowProps={{
        label: checksText,
        fullWidth: true,
        isInvalid,
        error: hasError,
      }}
      elementProps={{
        isInvalid,
        setOptions: {
          ...setOptions,
          enableLiveAutocompletion: true,
          enableSnippets: true
        },
        isCustomMode: true,
        mode: 'watch_editor',
        width: '100%',
        height: '500px',
        theme,
        insertText: insertCheckTemplate,
        onChange: (e, query, field, form) => {
          form.setFieldValue(field.name, query);
          onChange(e.end);
        },
        onBlur: (e, field, form) => {
          form.setFieldTouched(field.name, true);
        },
      }}
      formikFieldProps={{
        validate: validateWatchString
      }}
    />
  );

  return (
    <EuiFlexGroup>
      <EuiFlexItem>{renderChecksEditor()}</EuiFlexItem>
      {!isEmpty(response) && (
        <EuiFlexItem>
          <WatchResponse
            response={response}
            onClose={() => setFieldValue('_ui.checksResult', null)}
          />
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
};

JsonWatch.propTypes = {
  dispatch: PropTypes.func.isRequired,
  formik: PropTypes.object.isRequired,
  insertCheckTemplate: PropTypes.shape({
    row: PropTypes.number,
    column: PropTypes.column,
    text: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default connectRedux()(connectFormik(JsonWatch));
