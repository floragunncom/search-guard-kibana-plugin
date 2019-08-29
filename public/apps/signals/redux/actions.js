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

export const addErrorToast = error => ({
  type: ADD_ERROR_TOAST,
  title: 'Error',
  text: get(error, 'data.message') || error.message || error,
  color: 'danger',
  iconType: 'alert'
});

export const removeToast = id => ({
  type: REMOVE_TOAST,
  id
});
