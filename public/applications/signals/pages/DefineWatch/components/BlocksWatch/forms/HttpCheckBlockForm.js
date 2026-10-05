/* eslint-disable @kbn/eslint/require-license-header */
import React, { useContext } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import {
  FormikFieldNumber,
  FormikFieldText,
  FormikFieldPassword,
  FormikComboBox,
  FormikSwitch,
  SubHeader,
} from '../../../../../components';
import { RowHelpTextMustacheRuntimeDataField } from '../../RowHelpText';
import { CheckCodeEditor } from './CheckCodeEditor';
import { CheckType } from './CheckType';
import { CheckName } from './CheckName';
import { CheckTarget } from './CheckTarget';
import { CheckResponse } from './CheckResponse';
import { ResponseLabelAppend } from './ResponseLabelAppend';
import { EDITOR_OPTIONS } from '../utils/constants';
import { HTTP_METHODS } from '../utils/checkBlocks';
import {
  validateJsonOptionalString,
  validateEmptyField,
  validateEmptyComboBox,
  isInvalid,
  hasError,
} from '../../../utils/validate';
import { DOC_LINKS } from '../../../../../utils/constants';
import {
  connectionTimeoutText,
  readTimeoutText,
  queryParamsText,
  headersText,
  bodyText,
  methodText,
  pathText,
  authText,
  typeText,
  usernameText,
  passwordText,
  trustedCertsText,
  privateKeyText,
  privateKeyPasswordText,
  trustAllText,
  certsText,
  optionalText,
  verifyHostnamesText,
} from '../../../../../utils/i18n/watch';

import { Context } from '../../../../../Context';

export function ConnectionTimeout({ path }) {
  return (
    <FormikFieldNumber
      name={path}
      formRow
      rowProps={{
        label: connectionTimeoutText,
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

export function ReadTimeout({ path }) {
  return (
    <FormikFieldNumber
      name={path}
      formRow
      rowProps={{
        label: readTimeoutText,
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

export function RequestUrl({ path }) {
  return (
    <FormikFieldText
      name={path}
      formRow
      rowProps={{
        label: 'URL',
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

export function RequestMethod({ path }) {
  const { onComboBoxChange } = useContext(Context);

  return (
    <FormikComboBox
      name={path}
      formRow
      formikFieldProps={{ validate: validateEmptyComboBox }}
      rowProps={{
        label: methodText,
        error: hasError,
        isInvalid,
      }}
      elementProps={{
        options: HTTP_METHODS,
        isClearable: false,
        singleSelection: { asPlainText: true },
        onChange: onComboBoxChange(validateEmptyComboBox),
      }}
    />
  );
}

export function RequestPath({ path, checksResult }) {
  return (
    <FormikFieldText
      name={path}
      formRow
      rowProps={{
        label: pathText,
        helpText: (
          <RowHelpTextMustacheRuntimeDataField checksResult={checksResult} isOptional={true} />
        ),
      }}
      elementProps={{
        onFocus: (e, field, form) => {
          form.setFieldError(field.name, undefined);
        },
      }}
    />
  );
}

export function RequestQueryParams({ path, checksResult }) {
  return (
    <CheckCodeEditor
      formikFieldProps={{
        validate: validateJsonOptionalString,
      }}
      editorProps={{
        mode: 'json',
        setOptions: {
          minLines: 5,
          maxLines: 5,
        },
      }}
      rowProps={{
        label: queryParamsText,
        helpText: (
          <RowHelpTextMustacheRuntimeDataField checksResult={checksResult} isOptional={true} />
        ),
      }}
      valuePath={path}
      docLink={DOC_LINKS.INPUTS.HTTP}
    />
  );
}

export function RequestHeaders({ path }) {
  return (
    <CheckCodeEditor
      formikFieldProps={{
        validate: validateJsonOptionalString,
      }}
      editorProps={{
        mode: 'json',
        setOptions: {
          minLines: 5,
          maxLines: 5,
        },
      }}
      rowProps={{
        label: headersText,
        helpText: optionalText,
      }}
      valuePath={path}
      docLink={DOC_LINKS.INPUTS.HTTP}
    />
  );
}

export function RequestBody({ path, checksResult }) {
  return (
    <CheckCodeEditor
      editorProps={{
        mode: 'text',
        setOptions: EDITOR_OPTIONS,
      }}
      rowProps={{
        label: bodyText,
        helpText: (
          <RowHelpTextMustacheRuntimeDataField checksResult={checksResult} isOptional={true} />
        ),
      }}
      valuePath={path}
      docLink={DOC_LINKS.INPUTS.HTTP}
    />
  );
}

export function HttpTls({ path }) {
  const { onSwitchChange } = useContext(Context);

  return (
    <FormikSwitch
      name={path}
      formRow
      rowProps={{
        hasEmptyLabelSpace: true,
        style: { marginTop: '0px' },
      }}
      elementProps={{
        label: 'TLS',
        onChange: onSwitchChange,
      }}
    />
  );
}

export function RequestAuth({ path }) {
  const { onSwitchChange } = useContext(Context);

  return (
    <FormikSwitch
      name={path}
      formRow
      rowProps={{
        hasEmptyLabelSpace: true,
        style: { marginTop: '0px' },
      }}
      elementProps={{
        label: authText,
        onChange: onSwitchChange,
      }}
    />
  );
}

export function RequestAuthType({ path }) {
  return (
    <FormikFieldText
      name={path}
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

export function RequestAuthUsername({ path, isRequired = false } = {}) {
  const formikFieldProps = {};
  const rowProps = { label: usernameText };
  const elementProps = {
    onFocus: (e, field, form) => {
      form.setFieldError(field.name, undefined);
    },
  };

  if (isRequired) {
    rowProps.isInvalid = isInvalid;
    rowProps.error = hasError;
    elementProps.isInvalid = isInvalid;
    formikFieldProps.validate = validateEmptyField;
  }

  return (
    <FormikFieldText
      name={path}
      formRow
      rowProps={rowProps}
      elementProps={elementProps}
      formikFieldProps={formikFieldProps}
    />
  );
}

export function RequestAuthPassword({ path, isRequired = false } = {}) {
  const formikFieldProps = {};
  const rowProps = { label: passwordText };
  const elementProps = {
    onFocus: (e, field, form) => {
      form.setFieldError(field.name, undefined);
    },
  };

  if (isRequired) {
    rowProps.isInvalid = isInvalid;
    rowProps.error = hasError;
    elementProps.isInvalid = isInvalid;
    formikFieldProps.validate = validateEmptyField;
  }

  return (
    <FormikFieldPassword
      name={path}
      formRow
      rowProps={rowProps}
      elementProps={elementProps}
      formikFieldProps={formikFieldProps}
    />
  );
}

export function TlsTrustedCerts({ path }) {
  return (
    <CheckCodeEditor
      editorProps={{
        mode: 'text',
        setOptions: {
          minLines: 17,
          maxLines: 17,
        },
      }}
      rowProps={{
        label: trustedCertsText,
        helpText: optionalText,
      }}
      valuePath={path}
      docLink={DOC_LINKS.INPUTS.HTTP}
    />
  );
}

export function TlsClientAuthCerts({ path }) {
  return (
    <CheckCodeEditor
      editorProps={{
        mode: 'text',
        setOptions: {
          minLines: 5,
          maxLines: 5,
        },
      }}
      rowProps={{
        label: certsText,
        helpText: optionalText,
      }}
      valuePath={path}
      docLink={DOC_LINKS.INPUTS.HTTP}
    />
  );
}

export function TlsClientAuthPrivateKey({ path }) {
  return (
    <CheckCodeEditor
      editorProps={{
        mode: 'text',
        setOptions: {
          minLines: 5,
          maxLines: 5,
        },
      }}
      rowProps={{
        label: privateKeyText,
        helpText: optionalText,
      }}
      valuePath={path}
      docLink={DOC_LINKS.INPUTS.HTTP}
    />
  );
}

export function TlsClientAuthPrivateKeyPassword({ path }) {
  return (
    <FormikFieldPassword
      name={path}
      formRow
      rowProps={{
        label: privateKeyPasswordText,
        helpText: optionalText,
      }}
      elementProps={{
        onFocus: (e, field, form) => {
          form.setFieldError(field.name, undefined);
        },
      }}
    />
  );
}

export function TlsTrustAll({ path }) {
  const { onSwitchChange } = useContext(Context);

  return (
    <FormikSwitch
      name={path}
      formRow
      rowProps={{
        hasEmptyLabelSpace: true,
        style: { marginTop: '0px' },
      }}
      elementProps={{
        label: trustAllText,
        onChange: onSwitchChange,
      }}
    />
  );
}

export function TlsVerifyHostnames({ path }) {
  const { onSwitchChange } = useContext(Context);

  return (
    <FormikSwitch
      name={path}
      formRow
      rowProps={{
        hasEmptyLabelSpace: true,
        style: { marginTop: '0px' },
      }}
      elementProps={{
        label: verifyHostnamesText,
        onChange: onSwitchChange,
      }}
    />
  );
}

export function HttpCheckBlockForm({ index, checkBlock, checksBlocksPath, onCloseResult }) {
  const blockPath = `${checksBlocksPath}[${index}]`;
  const typePath = `${blockPath}.type`;
  const namePath = `${blockPath}.name`;
  const targetPath = `${blockPath}.target`;
  const isTLSPath = `${blockPath}.isTLS`;
  const isAuthPath = `${blockPath}.isAuth`;
  const connectionTimeoutPath = `${blockPath}.connection_timeout`;
  const readTimeoutPath = `${blockPath}.read_timeout`;

  const requestPath = `${blockPath}.request`;
  const requestURLPath = `${requestPath}.url`;
  const requestPathPath = `${requestPath}.path`;
  const requestQueryParamsPath = `${requestPath}.query_params`;
  const requestMethodPath = `${requestPath}.method`;
  const requestHeadersPath = `${requestPath}.headers`;
  const requestBodyPath = `${requestPath}.body`;
  const requestAuthPath = `${requestPath}.auth`;
  const requestAuthTypePath = `${requestAuthPath}.type`;
  const requestAuthUsernamePath = `${requestAuthPath}.username`;
  const requestAuthPasswordPath = `${requestAuthPath}.password`;

  const tlsPath = `${blockPath}.tls`;
  const tlsTrustAllPath = `${tlsPath}.trust_all`;
  const tlsVerifyHostnamesPath = `${tlsPath}.verify_hostnames`;
  const tlsTrustedCertsPath = `${tlsPath}.trusted_certs`;
  const tlsClientAuthPath = `${tlsPath}.client_auth`;
  const tlsClientAuthCertsPath = `${tlsClientAuthPath}.certs`;
  const tlsClientAuthPrivateKeyPath = `${tlsClientAuthPath}.private_key`;
  const tlsClientAuthPrivateKeyPasswordPath = `${tlsClientAuthPath}.private_key_password`;

  // For now hide the checks execution for the action checks. Because it confuses.
  // The SG Elasticsearch plugin API is not ready to send the proper response yet.
  // TODO. Remove the isAction constant usage when the API is ready.
  const isAction = checksBlocksPath.includes('actions');

  function renderAuth() {
    return (
      <>
        <EuiSpacer />
        <SubHeader title={<h4>{authText}</h4>} />
        <EuiFlexGroup>
          <EuiFlexItem>
            <RequestAuthType path={requestAuthTypePath} />
          </EuiFlexItem>
          <EuiFlexItem>
            <RequestAuthUsername path={requestAuthUsernamePath} isRequired={checkBlock.isAuth} />
            <RequestAuthPassword path={requestAuthPasswordPath} isRequired={checkBlock.isAuth} />
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    );
  }

  function renderTLS() {
    return (
      <>
        <EuiSpacer />
        <SubHeader title={<h4>TLS</h4>} />
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem grow={false}>
                <TlsTrustAll path={tlsTrustAllPath} />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <TlsVerifyHostnames path={tlsVerifyHostnamesPath} />
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size="s" />
            <EuiFlexGroup>
              <EuiFlexItem>
                <TlsTrustedCerts path={tlsTrustedCertsPath} />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <TlsClientAuthPrivateKeyPassword path={tlsClientAuthPrivateKeyPasswordPath} />
            <TlsClientAuthPrivateKey path={tlsClientAuthPrivateKeyPath} />
            <TlsClientAuthCerts path={tlsClientAuthCertsPath} />
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    );
  }

  function renderResponse() {
    return (
      <EuiFlexItem>
        <CheckResponse
          value={checkBlock.response}
          rowProps={{
            labelAppend: <ResponseLabelAppend onClick={() => onCloseResult(index)} />,
          }}
          editorProps={{
            setOptions: EDITOR_OPTIONS,
          }}
        />
      </EuiFlexItem>
    );
  }

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem>
          <CheckType typePath={typePath} />
          <CheckName namePath={namePath} />
          <CheckTarget targetPath={targetPath} />
        </EuiFlexItem>
        <EuiFlexItem>
          <ConnectionTimeout path={connectionTimeoutPath} />
          <ReadTimeout path={readTimeoutPath} />

          <EuiSpacer />
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <HttpTls path={isTLSPath} />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <RequestAuth path={isAuthPath} />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer />
      <EuiFlexGroup>
        <EuiFlexItem>
          <RequestUrl path={requestURLPath} />
          <RequestMethod path={requestMethodPath} />
        </EuiFlexItem>
        <EuiFlexItem>
          <RequestPath path={requestPathPath} checksResult={checkBlock.response} />
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer />
      <EuiFlexGroup>
        <EuiFlexItem>
          <RequestQueryParams path={requestQueryParamsPath} checksResult={checkBlock.response} />
        </EuiFlexItem>
        <EuiFlexItem>
          <RequestHeaders path={requestHeadersPath} />
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer />
      <EuiFlexGroup>
        <EuiFlexItem>
          <RequestBody path={requestBodyPath} checksResult={checkBlock.response} />
        </EuiFlexItem>
        {checkBlock.response && !isAction && renderResponse()}
      </EuiFlexGroup>

      {checkBlock.isAuth && renderAuth()}
      {checkBlock.isTLS && renderTLS()}
    </>
  );
}
