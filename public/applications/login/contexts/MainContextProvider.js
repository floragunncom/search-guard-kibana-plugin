import React, { useState } from 'react';
import {EuiCodeBlock, EuiGlobalToastList, EuiText, EuiTitle} from '@elastic/eui';
import uuid from "uuid/v4";
import {get} from "lodash";

const MainContext = React.createContext();

// @todo Should be available in core somewhere
//const IS_DARK_THEME = chrome.getUiSettingsClient().get('theme:darkMode');

const MainContextProvider = ({ children, httpClient }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = ({ id }) =>
    setToasts(prevState => prevState.filter(toast => toast.id !== id));

  const addSuccessToast = (text, title = null) =>
    setToasts(prevState => {
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

  const addWarningToast = text =>
    setToasts(prevState => {
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

    setToasts(prevState => {
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
          httpClient,
          addSuccessToast,
          addWarningToast,
          addErrorToast,
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
