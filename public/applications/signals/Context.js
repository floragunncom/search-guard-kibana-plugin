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
import { Flyout, Modal } from './components';
import {
  closeFlyoutProvider,
  triggerFlyoutProvider,
  closeModalProvider,
  triggerConfirmModalProvider,
  triggerConfirmDeletionModalProvider,
  onSelectChangeProvider,
  onSwitchChangeProvider,
  onComboBoxChangeProvider,
  onComboBoxCreateOptionProvider,
  onComboBoxOnBlurProvider,
  removeToastProvider,
  addSuccessToastProvider,
  addWarningToastProvider,
  addErrorToastProvider,
  triggerErrorCalloutProvider,
  triggerSuccessCalloutProvider,
} from '../utils/context/providers';
import { FLYOUTS } from './utils/constants';
import { CODE_EDITOR } from '../utils/constants';

// Themes for EuiCodeEditor
import 'brace/theme/twilight';
import 'brace/theme/textmate';

const Context = React.createContext();

const { darkTheme, theme: lightTheme, ...editorOptionsDefaults } = CODE_EDITOR;

const ContextProvider = ({ children, httpClient, core, configService }) => {
  const IS_DARK_THEME = core.uiSettings.get('theme:darkMode');

  const [editorTheme] = useState(IS_DARK_THEME ? darkTheme : lightTheme);
  const [editorOptions] = useState(editorOptionsDefaults);
  const [flyout, setFlyout] = useState(null);
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [callout, setCallout] = useState(null);

  function closeFlyout() {
    closeFlyoutProvider({ setFlyout });
  }

  function triggerFlyout(newFlyout) {
    triggerFlyoutProvider({ flyout: newFlyout, prevFlyout: flyout, setFlyout });
  }

  function triggerInspectJsonFlyout(payload) {
    triggerFlyoutProvider({
      flyout: {
        type: FLYOUTS.INSPECT_JSON,
        payload: { editorTheme, ...payload },
      },
      setFlyout,
    });
  }

  function closeModal() {
    closeModalProvider({ setModal });
  }

  function triggerConfirmModal(payload) {
    triggerConfirmModalProvider({ payload, setModal });
  }

  function triggerConfirmDeletionModal(payload) {
    triggerConfirmDeletionModalProvider({ payload, setModal });
  }

  function onSelectChange(e, field) {
    onSelectChangeProvider(e, field);
  }

  function onSwitchChange(e, field, form) {
    onSwitchChangeProvider(e, field, form);
  }

  function onComboBoxChange(validationFn) {
    return function (options, field, form) {
      onComboBoxChangeProvider({ setModal, validationFn })(options, field, form);
    };
  }

  function onComboBoxCreateOption(validationFn, ...props) {
    return function (label, field, form) {
      onComboBoxCreateOptionProvider(validationFn, ...props)(label, field, form);
    };
  }

  function onComboBoxOnBlur(e, field, form) {
    onComboBoxOnBlurProvider(e, field, form);
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

  function triggerErrorCallout(error) {
    triggerErrorCalloutProvider({ error, setCallout });
  }

  function triggerSuccessCallout(payload) {
    triggerSuccessCalloutProvider({ payload, setCallout });
  }

  return (
    <>
      <Context.Provider
        value={{
          editorTheme,
          editorOptions,
          httpClient,
          configService,
          onSelectChange,
          onSwitchChange,
          onComboBoxChange,
          onComboBoxCreateOption,
          onComboBoxOnBlur,
          closeFlyout,
          triggerFlyout,
          triggerInspectJsonFlyout,
          closeModal,
          triggerConfirmModal,
          triggerConfirmDeletionModal,
          addSuccessToast,
          addWarningToast,
          addErrorToast,
          callout,
          setCallout,
          triggerErrorCallout,
          triggerSuccessCallout,
        }}
      >
        {children}
      </Context.Provider>

      <Flyout flyout={flyout} onClose={closeFlyout} />

      <Modal modal={modal} onClose={closeModal} />

      <div style={{ zIndex: 9000 }}>
        <EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={6000} />
      </div>
    </>
  );
};

export { ContextProvider, Context };
