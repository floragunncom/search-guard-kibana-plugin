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
import { EuiGlobalToastList } from '@elastic/eui';
import { Modal } from '../../components';
import {
  closeModalProvider,
  removeToastProvider,
  addSuccessToastProvider,
  addWarningToastProvider,
  addErrorToastProvider,
} from '../../utils/context/providers';

const MainContext = React.createContext();

const MainContextProvider = ({
  children,
  httpClient,
  chromeHelper,
  configService,
  kibanaApplication,
}) => {
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);

  function closeModal() {
    closeModalProvider({ setModal });
  }

  function removeToast({ id }) {
    removeToastProvider({ id, setToasts });
  }

  function addSuccessToast(text) {
    addSuccessToastProvider({ text, setToasts });
  }

  function addWarningToast(text) {
    addWarningToastProvider({ text, setToasts });
  }

  function addErrorToast(error, { title = 'Error', errorMessage, errorDetails } = {}) {
    addErrorToastProvider({
      error,
      setModal,
      setToasts,
      options: { title, errorMessage, errorDetails },
    });
  }

  return (
    <>
      <MainContext.Provider
        value={{
          kibanaApplication,
          httpClient,
          chromeHelper,
          configService,
          addSuccessToast,
          addWarningToast,
          addErrorToast,
        }}
      >
        {children}
      </MainContext.Provider>

      <Modal modal={modal} onClose={closeModal} />

      <div style={{ zIndex: 9000 }}>
        <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={6000} />
      </div>
    </>
  );
};

export { MainContextProvider, MainContext };
