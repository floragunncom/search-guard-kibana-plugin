/* eslint-disable @kbn/eslint/require-license-header */
import { defaultsDeep, pickBy, identity } from 'lodash';
import { stringifyPretty } from '../../../../../utils/helpers';

const COMMON_DEFAULTS = {
  name: '',
  target: '',
};

export const STATIC_DEFAULTS = {
  type: 'static',
  value: '',
  ...COMMON_DEFAULTS,
};

export const HTTP_DEFAULTS = {
  type: 'http',
  request: '',
  tls: '',
  ...COMMON_DEFAULTS,
};

export const SEARCH_DEFAULTS = {
  type: 'search',
  request: '',
  ...COMMON_DEFAULTS,
};

export function staticToFormikStatic(check = {}) {
  const formik = defaultsDeep(
    {
      ...check,
      value: stringifyPretty(check.value),
    },
    STATIC_DEFAULTS
  );

  return formik;
}

export function formikStaticToStatic(check = {}) {
  return pickBy(
    {
      ...check,
      value: JSON.parse(check.value),
    },
    identity
  );
}

export function searchToFormikSearch(check = {}) {
  const formik = defaultsDeep(
    {
      ...check,
      value: stringifyPretty(check.request),
    },
    SEARCH_DEFAULTS
  );

  delete formik.request;
  return formik;
}

export function formikSearchToSearch({ value, ...rest }) {
  return pickBy(
    {
      ...rest,
      request: JSON.parse(value),
    },
    identity
  );
}

export function httpToFormikHttp(check = {}) {
  const formik = defaultsDeep(
    {
      ...check,
      value: stringifyPretty(check.request),
      tls: !check.tls ? check.tls : stringifyPretty(check.tls),
    },
    HTTP_DEFAULTS
  );

  delete formik.request;
  return formik;
}

export function formikHttpToHttp({ value, ...rest }) {
  return pickBy(
    {
      ...rest,
      request: JSON.parse(value),
    },
    identity
  );
}
