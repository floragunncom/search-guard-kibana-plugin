import React from 'react';
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
import { hasError, isInvalid, validateWatchString } from '../../../../utils/validate';
import WatchResponse from '../WatchResponse';

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
          tabSize: 2,
          useSoftTabs: true,
          enableLiveAutocompletion: true,
          enableSnippets: true
        },
        isCustomMode: true,
        mode: 'watch_editor',
        width: '100%',
        height: '500px',
        theme: 'github',
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
