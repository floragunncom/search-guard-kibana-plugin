import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'formik';
import { get } from 'lodash';
import {
  TitleSecondary,
  FormikCodeEditor
} from '../../../../components';
import {
  EuiHorizontalRule,
  EuiButton,
  EuiSpacer
} from '@elastic/eui';
import {
  elasticsearhQueryDLSText,
  documentLevelSecurityText,
} from '../../../../utils/i18n/roles';
import {
  isInvalid,
  hasError,
  validateESDLSQuery
} from '../../../../utils/validation';
import { stringifyPretty } from '../../../../utils/helpers';

const DocumentLevelSecurity = ({ index, httpClient, formik }) => {
  const { values, validateField, setFieldValue } = formik;
  const fieldPath = `_indexPermissions[${index}]._dls`;
  // TODO: should we validate all indexes? This logic was taken from the old app
  const firstIndexPattern = get(values, `_indexPermissions[${index}].index_patterns[0].label`);

  return (
    <Fragment>
      <TitleSecondary text={documentLevelSecurityText} />
      <EuiHorizontalRule />
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
          validate: validateESDLSQuery(firstIndexPattern, httpClient)
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
          theme: 'github',
          onChange: (dls, field, form) => {
            form.setFieldValue(field.name, dls);
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
  httpClient: PropTypes.func.isRequired,
  formik: PropTypes.shape({
    values: PropTypes.object.isRequired,
    validateField: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired
  }).isRequired
};

export default connect(DocumentLevelSecurity);
