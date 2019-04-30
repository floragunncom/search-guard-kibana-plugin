import { get } from 'lodash';

export const validateTextField = value => {
  if (!value) throw 'Required';
};

export const isInvalid = (name, form) => {
  return !!get(form.touched, name, false) && !!get(form.errors, name, false);
};

export const hasError = (name, form) => get(form.errors, name);
