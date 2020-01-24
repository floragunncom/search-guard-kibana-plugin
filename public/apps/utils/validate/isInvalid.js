import { get } from 'lodash';

export const isInvalid = (name, form) =>
  !!get(form.touched, name, false) && !!get(form.errors, name, false);
