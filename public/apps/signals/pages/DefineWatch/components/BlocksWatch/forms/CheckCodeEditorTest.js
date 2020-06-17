/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { EuiText, EuiLink } from '@elastic/eui';
import { FormikCodeEditor } from '../../../../../components';
import { isInvalid, hasError } from '../../../utils/validate';
import { valueText, documentationText } from '../../../../../utils/i18n/watch';

// import { Context } from '../../../../../Context';

export function CheckCodeEditor({ rowProps, editorProps, formikFieldProps, valuePath, docLink }) {
  // const { editorTheme, editorOptions: defaultEditorOptions } = useContext(Context);

  const thisRowProps = {
    fullWidth: true,
    labelAppend: (
      <EuiText size="xs">
        <EuiLink href={docLink} target="_blank">
          {documentationText}
        </EuiLink>
      </EuiText>
    ),
    ...rowProps,
  };

  const { setOptions, ...restEditorProps } = editorProps;

  const thisEditorProps = {
    width: '100%',
    setOptions: {
      // ...defaultEditorOptions,
      ...setOptions,
    },
    // theme: editorTheme,
    onChange: (e, query, field, form) => {
      form.setFieldValue(field.name, query);
    },
    onBlur: (e, field, form) => {
      form.setFieldTouched(field.name, true);
    },
    ...restEditorProps,
  };

  const thisFormikFieldProps = { ...formikFieldProps };

  if (thisFormikFieldProps.validate) {
    thisRowProps.isInvalid = isInvalid;
    thisRowProps.error = hasError;
    thisEditorProps.isInvalid = isInvalid;
  }

  return (
    <FormikCodeEditor
      formRow
      name={valuePath}
      rowProps={thisRowProps}
      elementProps={thisEditorProps}
      formikFieldProps={thisFormikFieldProps}
    />
  );
}

CheckCodeEditor.defultProps = {
  rowProps: {
    label: valueText,
  },
  editorProps: {
    isCustomMode: false,
    mode: 'text',
    setOptions: {},
  },
  formikFieldProps: {},
};

CheckCodeEditor.protoTypes = {
  valuePath: PropTypes.string.isRequired,
  docLink: PropTypes.string.isRequired,
  editorProps: PropTypes.shape({
    isCustomMode: PropTypes.bool,
    mode: PropTypes.string,
    setOptions: PropTypes.object,
  }),
  rowProps: PropTypes.shape({
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  }),
  formikFieldProps: PropTypes.shape({
    validate: PropTypes.func,
  }),
};
