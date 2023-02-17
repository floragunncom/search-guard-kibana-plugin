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

import React, { useEffect, useState, useContext } from 'react';
import queryString from 'query-string';
import { Formik } from 'formik';
import { EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { AccountsService } from '../../services';
import { ContentPanel, FormikCodeEditor, LabelAppendLink, CancelButton } from '../../components';
import { jsonText } from '../../utils/i18n/common';
import { readAccountText } from '../../utils/i18n/account';
import { APP_PATH, DOC_LINKS } from '../../utils/constants';
import { stringifyPretty } from '../../utils/helpers';
import { hasError, isInvalid, validateJsonString } from '../../utils/validate';
import { Context } from '../../Context';

export const FORMIK_DEFAULTS = { _json: '' };

export function accountToFormik(account) {
  if (!account) return FORMIK_DEFAULTS;
  return { _json: stringifyPretty(account) };
}

export function formikToAccount(formik) {
  return JSON.parse(formik._json);
}

export function DefineJsonAccount({ history, location }) {
  const { editorOptions, editorTheme, httpClient, addErrorToast } = useContext(Context);

  const isReadOnly = true;
  const { id: accountId, accountType } = queryString.parse(location.search);
  const accountService = new AccountsService(httpClient, accountType);

  const [resource, setResource] = useState(accountToFormik());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    setIsLoading(true);

    try {
      const { resp: account } = await accountService.get(accountId);
      setResource(accountToFormik(account));
    } catch (error) {
      console.error('DefineJsonAccount, fetchData', error);
      addErrorToast(error);
    }

    setIsLoading(false);
  }

  function navigateToAccounts() {
    history.push(APP_PATH.ACCOUNTS);
  }

  function renderEditor() {
    return (
      <FormikCodeEditor
        name="_json"
        formRow
        rowProps={{
          fullWidth: true,
          label: jsonText,
          isInvalid,
          error: hasError,
          labelAppend: (
            <LabelAppendLink
              name="spAlerting.jsonAccount.doc.getStarted"
              href={DOC_LINKS.GET_STARTED}
            />
          ),
        }}
        elementProps={{
          isReadOnly,
          isInvalid,
          setOptions: {
            ...editorOptions,
            maxLines: 40,
            minLines: 40,
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
    );
  }

  return (
    <Formik initialValues={resource} validateOnChange={false} enableReinitialize={true}>
      {() => {
        return (
          <ContentPanel
            title={readAccountText}
            isLoading={isLoading}
            actions={[<CancelButton onClick={navigateToAccounts} />]}
          >
            <EuiSpacer />
            <EuiFlexGroup>
              <EuiFlexItem>{renderEditor()}</EuiFlexItem>
            </EuiFlexGroup>
          </ContentPanel>
        );
      }}
    </Formik>
  );
}
