/* eslint-disable @kbn/eslint/require-license-header */
import React, { useState } from 'react';
import uuid from 'uuid/v4';
import { EuiGlobalToastList, EuiTitle, EuiText, EuiCodeBlock } from '@elastic/eui';
import { differenceBy, get } from 'lodash';
import { Flyout, Modal } from './components';
import { comboBoxOptionsToArray } from '../../apps/utils/helpers';
import { FLYOUTS, MODALS } from './utils/constants';
import { CODE_EDITOR } from '../../apps/utils/constants';

// Themes for EuiCodeEditor
import 'brace/theme/twilight';
import 'brace/theme/textmate';

const Context = React.createContext();

const { darkTheme, theme: lightTheme, ...editorOptionsDefaults } = CODE_EDITOR;

const ContextProvider = ({ children, httpClient, core }) => {
  const IS_DARK_THEME = core.uiSettings.get('theme:darkMode');

  const [editorTheme] = useState(IS_DARK_THEME ? darkTheme : lightTheme);
  const [editorOptions] = useState(editorOptionsDefaults);
  const [flyout, setFlyout] = useState(null);
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  const closeFlyout = () => setFlyout(null);

  const triggerFlyout = newFlyout => {
    const isSameFlyout = flyout && newFlyout && flyout.type === newFlyout.type;

    if (isSameFlyout) {
      setFlyout(null);
      return;
    }

    setFlyout(newFlyout);
  };

  const triggerInspectJsonFlyout = payload => {
    if (payload === null) {
      triggerFlyout(null);
      return;
    }

    triggerFlyout({ type: FLYOUTS.INSPECT_JSON, payload: { ...payload, editorTheme } });
  };

  const closeModal = () => setModal(null);

  const triggerModal = modal => setModal(modal);

  const triggerConfirmModal = payload => {
    const modal = payload === null ? null : { type: MODALS.CONFIRM, payload };
    triggerModal(modal);
  };

  const triggerConfirmDeletionModal = payload => {
    const modal = payload === null ? null : { type: MODALS.CONFIRM_DELETION, payload };
    triggerModal(modal);
  };

  const onSwitchChange = (e, field, form) => {
    // We trigger the switch by inverting the input bool value.
    // Formik passes 'true' or 'false'. But EuiSwitch requires it to be boolean not string, we deal with it here.
    form.setFieldValue(field.name, !(e.target.value === 'true' || e.target.value === true));
  };

  const onComboBoxChange = validationFn => (options, field, form) => {
    const isValidationRequired = validationFn instanceof Function;
    if (isValidationRequired) {
      const error = validationFn(options);
      if (error instanceof Promise) {
        error
          .then(_error => {
            throw _error;
          })
          .catch(_error => form.setFieldError(field.name, _error));
      } else {
        form.setFieldError(field.name, error);
      }
    }

    const isDeleting = field.value && options.length < field.value.length;

    if (isDeleting) {
      const optionToDelete = comboBoxOptionsToArray(
        differenceBy(field.value, options, 'label')
      ).join(', ');

      triggerConfirmDeletionModal({
        body: optionToDelete,
        onConfirm: () => {
          form.setFieldValue(field.name, options);
          triggerConfirmDeletionModal(null);
        },
      });
    } else {
      form.setFieldValue(field.name, options);
    }
  };

  const onComboBoxCreateOption = (validationFn, ...props) => async (label, field, form) => {
    let isValid = true;
    const isValidationRequired = validationFn instanceof Function;

    if (isValidationRequired) {
      const _isValid = validationFn(label, ...props);
      if (_isValid instanceof Promise) {
        await _isValid
          .then(_error => {
            throw _error;
          })
          .catch(_error => (isValid = _error));
      } else {
        isValid = _isValid;
      }
    }

    if (isValid) {
      const normalizedSearchValue = label.trim().toLowerCase();
      if (!normalizedSearchValue) return;
      form.setFieldValue(field.name, field.value.concat({ label }));
    }
  };

  const onComboBoxOnBlur = (e, field, form) => form.setFieldTouched(field.name, true);

  const removeToast = ({ id }) =>
    setToasts(prevState => prevState.filter(toast => toast.id !== id));

  const addSuccessToast = text =>
    setToasts(prevState => {
      return [
        ...prevState,
        {
          title: 'Success',
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

  const addErrorToast = error => {
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
          title: 'Error',
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
      <Context.Provider
        value={{
          editorTheme,
          editorOptions,
          httpClient,
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
