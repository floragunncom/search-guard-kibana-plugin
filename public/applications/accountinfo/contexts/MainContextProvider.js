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

import React, { useState } from 'react';

import { EuiCodeBlock, EuiGlobalToastList, EuiText, EuiTitle } from '@elastic/eui';
import uuid from 'uuid/v4';
import { get } from 'lodash';

const MainContext = React.createContext();

const MainContextProvider = ({ httpClient, configService, children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = ({ id }) =>
    setToasts((prevState) => prevState.filter((toast) => toast.id !== id));

  const addSuccessToast = (text, title = null) =>
    setToasts((prevState) => {
      return [
        ...prevState,
        {
          title: title || 'Success',
          text,
          color: 'success',
          iconType: 'check',
          id: uuid(),
        },
      ];
    });

  const addWarningToast = (text) =>
    setToasts((prevState) => {
      return [
        ...prevState,
        {
          title: 'Warning',
          text,
          color: 'warning',
          iconType: 'help',
          id: uuid(),
        },
      ];
    });

  const addErrorToast = (error, title = null) => {
    let text = get(error, 'data.message') || error.message || error;
    const detail = get(error, 'body.detail', undefined);

    if (detail) {
      text = (
        <>
          <EuiTitle>
            <h4>{text}</h4>
          </EuiTitle>
          <EuiText size="s">
            <p>Detail:</p>
          </EuiText>
          <EuiCodeBlock language="json">{JSON.stringify(detail, null, 2)}</EuiCodeBlock>
        </>
      );
    }

    setToasts((prevState) => {
      return [
        ...prevState,
        {
          title: title || 'Error',
          text,
          color: 'danger',
          iconType: 'alert',
          id: uuid(),
        },
      ];
    });
  };

  return (
    <>
      <MainContext.Provider
        value={{
          addSuccessToast,
          addWarningToast,
          addErrorToast,
          httpClient,
          configService,
        }}
      >
        {children}
      </MainContext.Provider>

      <div style={{ zIndex: 9000 }}>
        <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={6000} />
      </div>
    </>
  );
};

export { MainContextProvider, MainContext };
