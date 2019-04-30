import { get } from 'lodash';
import { i18nRequiredText } from './i18n_nodes';

export const validateTextField = value => {
  if (!value) throw i18nRequiredText;
};

export const isInvalid = (name, form) => {
  return !!get(form.touched, name, false) && !!get(form.errors, name, false);
};

export const hasError = (name, form) => get(form.errors, name);
