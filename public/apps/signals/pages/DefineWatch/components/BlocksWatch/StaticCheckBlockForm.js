/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext, useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCodeEditor,
  EuiFormRow,
  EuiText,
  EuiLink,
  EuiSpacer,
  EuiButton,
  EuiResizableContainer,
} from '@elastic/eui';
import { ResponseLabelAppend } from './ResponseLabelAppend';
import { FormikCodeEditor, FormikFieldText } from '../../../../components';
import { isInvalid, hasError, validateWatchString, validateEmptyField } from '../../utils/validate';
import {
  targetText,
  nameText,
  typeText,
  responseText,
  valueText,
  documentationText,
} from '../../../../utils/i18n/watch';
import { EDITOR_OPTIONS } from './utils/constants';
import { DOC_LINKS } from '../../../../utils/constants';

import { Context } from '../../../../Context';

export function CheckType({ typePath }) {
  return (
    <FormikFieldText
      name={typePath}
      formRow
      rowProps={{
        label: typeText,
      }}
      elementProps={{
        readOnly: true,
        onFocus: (e, field, form) => {
          form.setFieldError(field.name, undefined);
        },
      }}
    />
  );
}

export function CheckName({ namePath }) {
  return (
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
        validate: validateEmptyField,
      }}
    />
  );
}

export function CheckTarget({ targetPath }) {
  return (
    <FormikFieldText
      name={targetPath}
      formRow
      rowProps={{
        label: targetText,
      }}
      elementProps={{
        onFocus: (e, field, form) => {
          form.setFieldError(field.name, undefined);
        },
      }}
    />
  );
}

export function CheckResponse({ index, editorOptions, editorTheme, checkBlock, onCloseResult }) {
  return (
    <EuiFormRow
      fullWidth
      label={responseText}
      labelAppend={<ResponseLabelAppend onClick={() => onCloseResult(index)} />}
    >
      <EuiCodeEditor
        isReadOnly
        mode="json"
        theme={editorTheme}
        width="100%"
        value={checkBlock.response}
        setOptions={{
          ...editorOptions,
        }}
      />
    </EuiFormRow>
  );
}

export function CheckCodeEditor({ editorTheme, editorOptions, valuePath, docLink }) {
  return (
    <FormikCodeEditor
      name={valuePath}
      formRow
      rowProps={{
        fullWidth: true,
        label: valueText,
        isInvalid,
        error: hasError,
        labelAppend: (
          <EuiText size="xs">
            <EuiLink href={docLink} target="_blank">
              {documentationText}
            </EuiLink>
          </EuiText>
        ),
      }}
      elementProps={{
        isCustomMode: false,
        mode: 'json',
        width: '100%',
        isInvalid,
        setOptions: {
          ...editorOptions,
        },
        theme: editorTheme,
        onChange: (e, query, field, form) => {
          form.setFieldValue(field.name, query);
        },
        onBlur: (e, field, form) => {
          form.setFieldTouched(field.name, true);
        },
      }}
      formikFieldProps={{
        validate: validateWatchString,
      }}
    />
  );
}

export function StaticCheckBlockForm({ index, checkBlock, checksBlocksPath, onCloseResult }) {
  const { editorTheme, editorOptions } = useContext(Context);

  const typePath = `${checksBlocksPath}[${index}].type`;
  const namePath = `${checksBlocksPath}[${index}].name`;
  const targetPath = `${checksBlocksPath}[${index}].target`;
  const valuePath = `${checksBlocksPath}[${index}].value`;

  return (
    <>
      <CheckType typePath={typePath} />
      <CheckName namePath={namePath} />
      <CheckTarget targetPath={targetPath} />
      <EuiSpacer />

      <EuiFlexGroup>
        <EuiFlexItem>
          <CheckCodeEditor
            editorTheme={editorTheme}
            editorOptions={{ ...editorOptions, ...EDITOR_OPTIONS }}
            valuePath={valuePath}
            docLink={DOC_LINKS.INPUTS.STATIC}
          />
        </EuiFlexItem>
        {checkBlock.response && (
          <EuiFlexItem>
            <CheckResponse
              index={index}
              editorTheme={editorTheme}
              editorOptions={{ ...editorOptions, ...EDITOR_OPTIONS }}
              checkBlock={checkBlock}
              onCloseResult={onCloseResult}
            />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </>
  );
}
