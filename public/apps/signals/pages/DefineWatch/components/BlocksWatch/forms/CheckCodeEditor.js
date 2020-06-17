/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { EuiText, EuiLink } from '@elastic/eui';
import { FormikCodeEditor } from '../../../../../components';
import { isInvalid, hasError } from '../../../utils/validate';
import { valueText, documentationText } from '../../../../../utils/i18n/watch';

import { Context } from '../../../../../Context';

// TODO: refactor to pass props objects instead of individual props
export function CheckCodeEditor({
  editorOptions,
  valuePath,
  docLink,
  mode,
  isCustomMode,
  rowLabel,
  validateFn,
}) {
  const { editorTheme, editorOptions: defaultEditorOptions } = useContext(Context);

  const rowProps = {
    fullWidth: true,
    label: rowLabel ? rowLabel : valueText,
    labelAppend: (
      <EuiText size="xs">
        <EuiLink href={docLink} target="_blank">
          {documentationText}
        </EuiLink>
      </EuiText>
    ),
  };

  const elementProps = {
    isCustomMode,
    mode,
    width: '100%',
    setOptions: {
      ...defaultEditorOptions,
      ...editorOptions,
    },
    theme: editorTheme,
    onChange: (e, query, field, form) => {
      form.setFieldValue(field.name, query);
    },
    onBlur: (e, field, form) => {
      form.setFieldTouched(field.name, true);
    },
  };

  const formikFieldProps = {};

  if (validateFn) {
    formikFieldProps.validate = validateFn;
    rowProps.isInvalid = isInvalid;
    rowProps.error = hasError;
    elementProps.isInvalid = isInvalid;
  }

  return (
    <FormikCodeEditor
      formRow
      name={valuePath}
      rowProps={rowProps}
      elementProps={elementProps}
      formikFieldProps={formikFieldProps}
    />
  );
}

CheckCodeEditor.defultProps = {
  editorOptions: {},
  mode: 'text',
  isCustomMode: false,
};

CheckCodeEditor.protoTypes = {
  valuePath: PropTypes.string.isRequired,
  docLink: PropTypes.string.isRequired,
  mode: PropTypes.string,
  isCustomMode: PropTypes.bool,
  editorOptions: PropTypes.object,
  rowLabel: PropTypes.node,
  validateFn: PropTypes.func,
};
