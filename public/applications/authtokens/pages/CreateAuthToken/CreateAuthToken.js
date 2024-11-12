/*
 *    Copyright 2021 floragunn GmbH
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

import React, { useContext, useState, useEffect } from 'react';
import { Formik } from 'formik';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiCodeBlock,
  EuiButton,
  EuiText,
} from '@elastic/eui';
import {
  FormikCodeEditor,
  ContentPanel,
  CancelButton,
  SaveButton,
  FormikFieldText,
  LabelAppendLink,
  FormikFieldNumber,
  FormikSelect,
  FormikSwitch, FormikCodeEditorSG,
} from '../../../components';
import { AuthTokensService } from '../../services';
import {
  createAuthTokenText,
  requestedPermissionsText,
  expiresAfterText,
  authTokenText,
  tokenConfirmModalText,
  copyTokenText,
} from '../../utils/i18n/auth_tokens';
import { nameText, advancedText, closeText } from '../../utils/i18n/common';
import {
  hasError,
  isInvalid,
  validateJsonString,
  validateEmptyField,
} from '../../utils/validation';
import { APP_PATH, DOC_LINKS, AUTH_TOKEN_ACTIONS } from '../../utils/constants';
import { tokenToFormik, formikToToken, EXPIRE_AFTER_SELECT_OPTIONS } from './utils';
import { Context } from '../../Context';

export function Name() {
  return (
    <FormikFieldText
      name="_name"
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

export function ExpiresAfter() {
  return (
    <EuiFlexGroup alignItems="flexStart" style={{ maxWidth: '425px' }}>
      <EuiFlexItem>
        <FormikFieldNumber
          name="_expires_after.value"
          formRow
          rowProps={{
            label: expiresAfterText,
            isInvalid,
            error: hasError,
          }}
          elementProps={{
            icon: 'clock',
            isInvalid,
            onFocus: (e, field, form) => {
              form.setFieldError(field.name, undefined);
            },
          }}
          formikFieldProps={{
            validate: validateEmptyField,
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <FormikSelect
          name="_expires_after.unit"
          formRow
          rowProps={{ hasEmptyLabelSpace: true }}
          elementProps={{ options: EXPIRE_AFTER_SELECT_OPTIONS }}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}

export function Permissions({ values, isReadOnly }) {
  const { editorOptions, editorTheme, onSwitchChange } = useContext(Context);

  return (
    <>
      <FormikSwitch
        formRow
        elementProps={{
          label: advancedText,
          onChange: onSwitchChange,
        }}
        name={`_isRequestedJSON`}
      />
      {values._isRequestedJSON && (
        <FormikCodeEditorSG
          name="_requested"
          formRow
          rowProps={{
            fullWidth: true,
            label: requestedPermissionsText,
            isInvalid,
            error: hasError,
            labelAppend: (
              <LabelAppendLink
                name="sgAuthToken-permissions"
                href={DOC_LINKS.CREATE_SG_ATH_TOKENS}
              />
            ),
          }}
          elementProps={{
            isReadOnly,
            isInvalid,
            setOptions: {
              ...editorOptions,
              maxLines: 50,
              minLines: 50,
            },
            mode: 'json',
            theme: editorTheme,
            width: '100%',
            onChange: (e, text, field, form) => {
              form.setFieldValue(field.name, text);
            },
            onBlur: (e, field, form) => {
              form.setFieldTouched(field.name, true);
            },
          }}
          formikFieldProps={{
            validate: validateJsonString,
          }}
        />
      )}
    </>
  );
}

Permissions.propTypes = {
  values: PropTypes.object.isRequired,
  isReadOnly: PropTypes.bool.isRequired,
};

function TokenConfirmModal({ token, onClose }) {
  if (!token) return null;

  return (
    <EuiModal onClose={onClose} data-test-subj="sgModal">
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <h1>{copyTokenText}</h1>
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody data-test-subj="sgModal.body">
        <EuiText>
          <p>{tokenConfirmModalText}</p>
        </EuiText>
        <EuiSpacer />
        <EuiCodeBlock language="html" isCopyable style={{ wordWrap: 'break-word' }}>
          {token}
        </EuiCodeBlock>
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButton onClick={onClose} fill data-test-subj="sgModal.footer.close">
          {closeText}
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}

export function CreateAuthToken({ history, location }) {
  const { triggerErrorCallout, httpClient } = useContext(Context);

  const [resource, setResource] = useState(tokenToFormik());
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);

  const service = new AuthTokensService(httpClient);
  const { id, action } = queryString.parse(location.search);
  const isReadOnly = action === AUTH_TOKEN_ACTIONS.READ_TOKEN;
  const contentPanelTitleText = isReadOnly ? authTokenText : createAuthTokenText;

  useEffect(() => {
    fetchData(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData(id) {
    setIsLoading(true);

    try {
      let res = {};
      if (id) {
        res = await service.get(id);
      }

      const uiResource = tokenToFormik(res, { _id: id });
      console.debug('CreateAuthToken, fetchData, uiResource', uiResource);

      setResource(uiResource);
    } catch (error) {
      console.error('CreateAuthToken, fetchData', error);
      triggerErrorCallout(error);
    }

    setIsLoading(false);
  }

  async function onSubmit(values, { setSubmitting }) {
    setIsLoading(true);

    try {
      let res = formikToToken(values);
      console.debug('CreateAuthToken, onSubmit, values', res);

      res = await service.save(res);
      setToken(res.token);
    } catch (error) {
      console.error('CreateAuthToken, onSubmit', error);
      setToken(null);
      triggerErrorCallout(error);
    }

    setIsLoading(false);
    setSubmitting(false);
  }

  function getContentPanelAction({ isSubmitting, handleSubmit }) {
    const contentPanelActions = [
      <CancelButton onClick={() => history.push(APP_PATH.AUTH_TOKENS)} />,
    ];
    // We don't allow to update tokens.
    if (!isReadOnly) {
      contentPanelActions.push(<SaveButton isLoading={isSubmitting} onClick={handleSubmit} />);
    }
    return contentPanelActions;
  }

  return (
    <Formik
      initialValues={resource}
      onSubmit={onSubmit}
      validateOnChange={false}
      enableReinitialize={true}
    >
      {({ values, handleSubmit, isSubmitting }) => {
        return (
          <>
            <ContentPanel
              title={contentPanelTitleText}
              isLoading={isLoading}
              actions={getContentPanelAction({ isSubmitting, handleSubmit })}
            >
              <Name />
              <EuiSpacer size="m" />

              <ExpiresAfter />
              <EuiSpacer size="m" />

              <Permissions values={values} isReadOnly={isReadOnly} />
            </ContentPanel>
            <TokenConfirmModal token={token} onClose={() => history.push(APP_PATH.AUTH_TOKENS)} />
          </>
        );
      }}
    </Formik>
  );
}

CreateAuthToken.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};
