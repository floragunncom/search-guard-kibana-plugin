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
import queryString from 'query-string';
import { Formik } from 'formik';
import {
  EuiSpacer,
  EuiCodeEditor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiLink,
  EuiText,
  EuiButton,
} from '@elastic/eui';
import {
  FormikCodeEditor,
  ContentPanel,
  CancelButton,
  SaveButton,
  LabelAppendLink,
  FormikErrorsCallOut, FormikCodeEditorSG, CodeEditor,
} from '../../../components';
import { APP_PATH, DOC_LINKS, WATCH_ACTIONS } from '../../utils/constants';
import { hasError, isInvalid, validateJsonString } from '../../utils/validate';
import {
  jsonText,
  readWatchText,
  createWatchText,
  updateWatchText,
  closeText,
  responseText,
  executeText,
} from '../../utils/i18n/watch';
import { WatchService } from '../../services';
import { Context } from '../../Context';
import { stringifyPretty } from '../../utils/helpers';

export const WATCH_DEFAULTS = {
  checks: [
    {
      type: 'static',
      name: 'constants',
      target: 'constants',
      value: {
        maxValue: 0,
      },
    },
    {
      type: 'search',
      name: 'asearch',
      target: 'asearch',
      request: {
        indices: ['*'],
        body: {
          size: 0,
          query: {
            match_all: {},
          },
        },
      },
    },
    {
      type: 'condition',
      source: 'data.asearch.hits.total.value > data.constants.maxValue',
    },
  ],
  active: true,
  trigger: {
    schedule: {
      interval: ['1m'],
    },
  },
  log_runtime_data: false,
  actions: [
    {
      type: 'webhook',
      name: 'myslack',
      throttle_period: '1s',
      request: {
        method: 'POST',
        url: 'https://hooks.slack.com/services/token',
        body: '{"text": "Value is {{data.asearch.hits.total.value}}"}',
        headers: {
          'Content-type': 'application/json',
        },
      },
    },
  ],
  _tenant: '_main',
  _id: 'example_watch',
};

export const FORMIK_DEFAULTS = { _json: JSON.stringify(WATCH_DEFAULTS, null, 2) };

export function watchToFormik(watch) {
  if (!watch) return FORMIK_DEFAULTS;
  delete watch._ui; // Delete _ui, whish holds graph and blocks watch properties
  return { _json: stringifyPretty(watch) };
}

export function formikToWatch(formik) {
  return JSON.parse(formik._json);
}

export function responseToEditorResponse(resp) {
  if (!resp || !Object.keys(resp).length) return 'Empty response! Something is wrong.';
  return stringifyPretty(resp.runtime_attributes ? resp.runtime_attributes : resp);
}

export function responseErrorToEditorError(error) {
  if (error && error.body) return stringifyPretty(error.body);
  return error.message ? error.message : error;
}

export function DefineJsonWatch({ history, location }) {
  const { editorOptions, editorTheme, httpClient, addErrorToast } = useContext(Context);
  const watchService = new WatchService(httpClient);

  const { id, action } = queryString.parse(location.search);
  let contentPanelTitleText = id ? updateWatchText : createWatchText;
  const isReadOnly = action === WATCH_ACTIONS.READ_WATCH;
  if (isReadOnly) contentPanelTitleText = readWatchText;

  const [resource, setResource] = useState(watchToFormik());
  const [isLoading, setIsLoading] = useState(false);
  const [isResponse, setIsResponse] = useState(false);
  const [responseValue, setResponseValue] = useState('');

  useEffect(() => {
    closeResponseEditor();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function navigateToWatches() {
    history.push(APP_PATH.WATCHES);
  }

  async function fetchData() {
    if (!id) return;
    setIsLoading(true);

    try {
      const { resp } = await watchService.get(id);
      setResource(watchToFormik(resp));
    } catch (error) {
      console.error('DefineJsonWatch, fetchData', error);
      addErrorToast(error);
    }

    setIsLoading(false);
  }

  async function onSubmit(values, { setSubmitting }) {
    setIsLoading(true);

    try {
      const { _id: id, ...watch } = formikToWatch(values);

      if (!id) throw new Error('Property _id is required.');
      await watchService.put(watch, id);

      navigateToWatches();
    } catch (error) {
      console.error('DefineJsonWatch, onSubmit', error);
      addErrorToast(error);
    }

    setIsLoading(false);
    setSubmitting(false);
  }

  async function executeWatch(values) {
    setIsLoading(true);
    let value;

    try {
      const watch = formikToWatch(values);
      delete watch._id;

      const { ok, resp } = await watchService.execute({
        watch,
        simulate: true,
        skipActions: false,
      });

      if (!ok) throw resp;
      value = responseToEditorResponse(resp);
    } catch (error) {
      console.error('DefineJsonWatch, executeWatch', error);

      value = responseErrorToEditorError(error);
      addErrorToast(error);
    }

    setResponseValue(value);
    setIsResponse(true);
    setIsLoading(false);
  }

  function getContentPanelAction({ isSubmitting, handleSubmit, values }) {
    const contentPanelActions = [<CancelButton onClick={navigateToWatches} />];
    // We don't allow to update tokens.
    if (!isReadOnly) {
      contentPanelActions.push(<SaveButton isLoading={isSubmitting} onClick={handleSubmit} />);
      contentPanelActions.push(
        <EuiButton
          isLoading={isLoading}
          isDisabled={isLoading}
          data-test-subj="sgSignals.jsonWatch.execute"
          onClick={() => executeWatch(values)}
        >
          {executeText}
        </EuiButton>
      );
    }
    return contentPanelActions;
  }

  function closeResponseEditor() {
    setIsResponse(false);
  }

  function renderWatchEditor() {
    return (
      <FormikCodeEditorSG
        name="_json"
        formRow
        rowProps={{
          fullWidth: true,
          label: jsonText,
          isInvalid,
          error: hasError,
          labelAppend: (
            <LabelAppendLink
              name="sgSignals.jsonWatch.doc.getStarted"
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

  function renderResponseEditor() {
    return (
      <EuiFormRow
        fullWidth
        label={responseText}
        labelAppend={
          <EuiText size="xs" onClick={closeResponseEditor}>
            <EuiLink id="close-response" data-test-subj="sgSignals.jsonWatch.closeResponse">
              {closeText} X
            </EuiLink>
          </EuiText>
        }
      >
        <CodeEditor
          mode="json"
          width="100%"
          theme={editorTheme}
          value={responseValue}
          readOnly
          setOptions={{
            ...editorOptions,
            maxLines: 41,
            minLines: 41,
          }}
        />
      </EuiFormRow>
    );
  }

  return (
    <Formik
      initialValues={resource}
      onSubmit={onSubmit}
      validateOnChange={false}
      enableReinitialize={true}
    >
      {({ values, handleSubmit, isSubmitting, errors }) => {
        return (
          <ContentPanel
            title={contentPanelTitleText}
            isLoading={isLoading}
            actions={getContentPanelAction({ isSubmitting, handleSubmit, values })}
          >
            <FormikErrorsCallOut errors={errors} />
            <EuiSpacer />
            <EuiFlexGroup>
              <EuiFlexItem>{renderWatchEditor()}</EuiFlexItem>
              {isResponse && <EuiFlexItem>{renderResponseEditor()}</EuiFlexItem>}
            </EuiFlexGroup>
          </ContentPanel>
        );
      }}
    </Formik>
  );
}
