/* eslint-disable @kbn/eslint/require-license-header */
import React, { Fragment, useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'formik';
import { get } from 'lodash';
import { SubHeader, FormikCodeEditor } from '../../../../components';
import { EuiButton, EuiSpacer } from '@elastic/eui';
import { elasticsearhQueryDLSText, documentLevelSecurityText } from '../../../../utils/i18n/roles';
import { isInvalid, hasError, validateESDLSQuery } from '../../../../utils/validation';
import { stringifyPretty } from '../../../../utils/helpers';

import { Context } from '../../../../Context';

const DocumentLevelSecurity = ({ index, formik }) => {
  const { editorTheme, editorOptions, httpClient } = useContext(Context);
  const { values, validateField, setFieldValue } = formik;
  const fieldPath = `_indexPermissions[${index}]._dls`;
  // TODO: should we validate all indexes? This logic was taken from the old app
  const firstIndexPattern = get(values, `_indexPermissions[${index}].index_patterns[0].label`);

  return (
    <Fragment>
      <SubHeader title={<h4>{documentLevelSecurityText}</h4>} />
      <EuiButton
        data-test-subj="sgDLSCheckButton"
        size="s"
        iconType="check"
        onClick={() => {
          validateField(fieldPath).then(() => {
            try {
              setFieldValue(fieldPath, stringifyPretty(JSON.parse(get(values, fieldPath))));
            } catch (err) {
              // do nothing if query is invalid JSON
            }
          });
        }}
      >
        Check
      </EuiButton>
      <EuiSpacer />
      <FormikCodeEditor
        name={fieldPath}
        formRow
        formikFieldProps={{
          validate: validateESDLSQuery(firstIndexPattern, httpClient),
        }}
        rowProps={{
          helpText: elasticsearhQueryDLSText,
          fullWidth: true,
          isInvalid,
          error: hasError,
        }}
        elementProps={{
          mode: 'text',
          width: '100%',
          height: '300px',
          setOptions: editorOptions,
          theme: editorTheme,
          onChange: (e, string, field, form) => {
            form.setFieldValue(field.name, string);
          },
          onBlur: (e, field, form) => {
            form.setFieldTouched(field.name, true);
          },
        }}
      />
    </Fragment>
  );
};

DocumentLevelSecurity.propTypes = {
  index: PropTypes.number.isRequired,
  formik: PropTypes.shape({
    values: PropTypes.object.isRequired,
    validateField: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired,
  }).isRequired,
};

export default connect(DocumentLevelSecurity);
