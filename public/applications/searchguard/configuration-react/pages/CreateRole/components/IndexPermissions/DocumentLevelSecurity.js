/*
 *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Fragment, useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'formik';
import { SubHeader, FormikCodeEditor } from '../../../../components';
import { EuiSpacer, EuiCallOut, EuiText } from '@elastic/eui';
import {
  elasticsearhQueryDLSText,
  documentLevelSecurityText,
  documentLevelSecurityDisabledText,
  createRoleDocumentLevelSecurityHelpText,
} from '../../../../utils/i18n/roles';
import { isInvalid, hasError } from '../../../../utils/validation';

import { Context } from '../../../../Context';

const DocumentLevelSecurity = ({ index }) => {
  const { editorTheme, editorOptions, configService } = useContext(Context);
  const isDlsEnabled = configService.dlsFlsEnabled();
  const fieldPath = `_indexPermissions[${index}]._dls`;

  function renderFeatureDisabledCallout() {
    return (
      <Fragment>
        <EuiSpacer />
        <EuiCallOut
          data-test-subj="sgDLSDisabledCallout"
          className="sgFixedFormItem"
          iconType="iInCircle"
          title={documentLevelSecurityDisabledText}
        />
      </Fragment>
    );
  }

  return !isDlsEnabled ? (
    renderFeatureDisabledCallout()
  ) : (
    <Fragment>
      <EuiSpacer />
      <SubHeader
        title={<h5>{documentLevelSecurityText}</h5>}
        description={<EuiText size="s">{createRoleDocumentLevelSecurityHelpText}</EuiText>}
      />
      {/*
      Uncomment the following button when the new DLS verification API is ready.
      https://floragunn.atlassian.net/browse/SGD-898

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
      */}
      <EuiSpacer />
      <FormikCodeEditor
        name={fieldPath}
        formRow
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
