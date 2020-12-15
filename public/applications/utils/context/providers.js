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
import React from 'react';
import uuid from 'uuid/v4';
import { differenceBy, get } from 'lodash';
import { ErrorToast } from '../../components';
import { comboBoxOptionsToArray } from '../helpers';
import { MODALS, CALLOUTS } from '../constants';

export function closeFlyoutProvider({ setFlyout }) {
  setFlyout(null);
}

export function triggerFlyoutProvider({ flyout, prevFlyout, setFlyout }) {
  const isSameFlyout = prevFlyout && flyout && prevFlyout.type === flyout.type;

  if (isSameFlyout) {
    setFlyout(null);
    return;
  }

  setFlyout(flyout);
}

export function closeModalProvider({ setModal }) {
  setModal(null);
}

export function triggerErrorDetailsModalProvider({ payload, setModal }) {
  const modal = payload === null ? null : { type: MODALS.ERROR_TOAST_DETAILS, payload };
  setModal(modal);
}

export function triggerConfirmModalProvider({ payload, setModal }) {
  const modal = payload === null ? null : { type: MODALS.CONFIRM, payload };
  setModal(modal);
}

export function triggerConfirmDeletionModalProvider({ payload, setModal }) {
  const modal = payload === null ? null : { type: MODALS.CONFIRM_DELETION, payload };
  setModal(modal);
}

export function onSelectChangeProvider(e, field) {
  field.onChange(e);
}

export function onSwitchChangeProvider(e, field, form) {
  // We trigger the switch by inverting the input bool value.
  // Formik passes 'true' or 'false'. But EuiSwitch requires it to be boolean not string, we deal with it here.
  form.setFieldValue(field.name, !(e.target.value === 'true' || e.target.value === true));
}

export function onComboBoxChangeProvider({ setModal, validationFn }) {
  return function (options, field, form) {
    const isValidationRequired = validationFn instanceof Function;

    if (isValidationRequired) {
      const error = validationFn(options);
      if (error instanceof Promise) {
        error
          .then((_error) => {
            throw _error;
          })
          .catch((_error) => form.setFieldError(field.name, _error));
      } else {
        form.setFieldError(field.name, error);
      }
    }

    const isDeleting = field.value && options.length < field.value.length;

    if (isDeleting) {
      const optionToDelete = comboBoxOptionsToArray(
        differenceBy(field.value, options, 'label')
      ).join(', ');

      triggerConfirmDeletionModalProvider({
        payload: {
          body: optionToDelete,
          onConfirm: () => {
            form.setFieldValue(field.name, options);
            closeModalProvider({ setModal });
          },
        },
        setModal,
      });
    } else {
      form.setFieldValue(field.name, options);
    }
  };
}

export function onComboBoxCreateOptionProvider(validationFn, ...props) {
  return async function (label, field, form) {
    let isValid = true;
    const isValidationRequired = validationFn instanceof Function;

    if (isValidationRequired) {
      const _isValid = validationFn(label, ...props);
      if (_isValid instanceof Promise) {
        await _isValid
          .then((_error) => {
            throw _error;
          })
          .catch((_error) => (isValid = _error));
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
}

export function onComboBoxOnBlurProvider(e, field, form) {
  form.setFieldTouched(field.name, true);
}

export function removeToastProvider({ id, setToasts }) {
  setToasts((prevState) => prevState.filter((toast) => toast.id !== id));
}

export function addSuccessToastProvider({ text, setToasts }) {
  setToasts((prevState) => {
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
}

export function addWarningToastProvider({ text, setToasts }) {
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
}

export function addErrorToastProvider({
  error,
  setToasts,
  setModal,
  options: { title = 'Error', errorMessage, errorDetails } = {},
}) {
  setToasts((prevState) => {
    return [
      ...prevState,
      {
        title,
        id: uuid(),
        color: 'danger',
        iconType: 'alert',
        text: (
          <ErrorToast
            error={error}
            errorMessage={errorMessage}
            errorDetails={errorDetails}
            onDetailsClick={(props) => {
              triggerErrorDetailsModalProvider({ payload: { title, ...props }, setModal });
            }}
          />
        ),
      },
    ];
  });
}

export function triggerErrorCalloutProvider({ error, setCallout }) {
  console.error('handleTriggerCallout', error);

  let payload = error.message;
  const detail = get(error, 'body.attributes.body');

  try {
    if (detail) {
      payload = `${payload}: ${JSON.stringify(detail, null, 2)}`;
    }
  } catch (e) {
    console.error('handleTriggerCallout', 'Error details cannot be parsed', error);
  }

  setCallout({
    type: CALLOUTS.ERROR_CALLOUT,
    payload,
  });
}

export function triggerSuccessCalloutProvider({ payload, setCallout }) {
  setCallout({
    type: CALLOUTS.SUCCESS_CALLOUT,
    payload,
  });
}
