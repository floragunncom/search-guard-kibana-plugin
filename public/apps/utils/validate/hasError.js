import { get } from 'lodash';

export const hasError = (name, form) => get(form.errors, name);
