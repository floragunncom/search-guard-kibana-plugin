import React from 'react';
import { connect as connectRedux } from 'react-redux';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import {
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import 'brace/theme/github';
import 'brace/mode/json';
import 'brace/mode/plain_text';
import 'brace/snippets/javascript';
import 'brace/ext/language_tools';
import { FormikCodeEditor } from '../../../../components';
import { checksText } from '../../../../utils/i18n/watch';
import { stringifyPretty } from '../../../../utils/helpers';
import { hasError, isInvalid, validateJsonString } from '../../../../utils/validate';
import WatchResponse from '../WatchResponse';

const JsonWatch = ({
  formik: {
    values: { _checksResult = null },
    setFieldValue,
  },
}) => {
  const response = !isEmpty(_checksResult) ? stringifyPretty(_checksResult) : null;

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
          useSoftTabs: true
        },
        mode: 'json',
        width: '100%',
        height: '500px',
        theme: 'github',
        onChange: (query, field, form) => {
          form.setFieldValue(field.name, query);
        },
        onBlur: (e, field, form) => {
          form.setFieldTouched(field.name, true);
        },
      }}
      formikFieldProps={{
        validate: validateJsonString
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
            onClose={() => setFieldValue('_checksResult', null)}
          />
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
};

JsonWatch.propTypes = {
  dispatch: PropTypes.func.isRequired,
  onChecksResult: PropTypes.func.isRequired,
  formik: PropTypes.object.isRequired
};

export default connectRedux()(connectFormik(JsonWatch));
