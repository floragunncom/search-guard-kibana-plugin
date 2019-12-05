import React from 'react';
import { EuiTitle, EuiText, EuiCodeBlock } from '@elastic/eui';
import { get } from 'lodash';
import {
  ADD_SUCCESS_TOAST,
  ADD_WARNING_TOAST,
  ADD_ERROR_TOAST,
  REMOVE_TOAST
} from './action_types';

export const addSuccessToast = text => ({
  type: ADD_SUCCESS_TOAST,
  title: 'Success',
  text,
  color: 'success',
  iconType: 'check'
});

export const addWarningToast = text => ({
  type: ADD_WARNING_TOAST,
  title: 'Warning',
  text,
  color: 'warning',
  iconType: 'help'
});

export const addErrorToast = error => {
  let text = get(error, 'data.message') || error.message || error;
  const detail = get(error, 'body.detail', undefined);

  if (detail) {
    text = (
      <>
        <EuiTitle><h4>{text}</h4></EuiTitle>
        <EuiText size="s"><p>Detail:</p></EuiText>
        <EuiCodeBlock language="json">{JSON.stringify(detail, null, 2)}</EuiCodeBlock>
      </>
    );
  }

  return {
    type: ADD_ERROR_TOAST,
    title: 'Error',
    text,
    color: 'danger',
    iconType: 'alert'
  };
};

export const removeToast = id => ({
  type: REMOVE_TOAST,
  id
});
