/* eslint-disable @kbn/eslint/require-license-header */
import { cloneDeep, defaultsDeep, pickBy, identity } from 'lodash';
import { stringifyPretty } from '../../../../../utils/helpers';

const COMMON_DEFAULTS = {
  name: '',
  target: '',
};

export const STATIC_DEFAULTS = {
  type: 'static',
  value: {},
  ...COMMON_DEFAULTS,
};

export const HTTP_DEFAULTS = {
  type: 'http',
  request: {},
  tls: {},
  ...COMMON_DEFAULTS,
};

export const SEARCH_DEFAULTS = {
  type: 'search',
  request: {},
  ...COMMON_DEFAULTS,
};

export const TRANSFORM_DEFAULTS = {
  type: 'transform',
  source: '',
  ...COMMON_DEFAULTS,
};

export function staticToFormikStatic(check = {}) {
  const formik = defaultsDeep(cloneDeep(check), STATIC_DEFAULTS);

  formik.value = stringifyPretty(formik.value);

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
  const formik = defaultsDeep(cloneDeep(check), SEARCH_DEFAULTS);

  formik.value = stringifyPretty(formik.request);
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
  const formik = defaultsDeep(cloneDeep(check), HTTP_DEFAULTS);

  formik.tls = !Object.keys(formik.tls).length ? '' : stringifyPretty(formik.tls);
  formik.value = stringifyPretty(formik.request);
  delete formik.request;

  return formik;
}

export function formikHttpToHttp({ value, ...rest }) {
  const check = pickBy(
    {
      ...rest,
      request: JSON.parse(value),
    },
    identity
  );

  if (check.tls) {
    check.tls = JSON.parse(check.tls);
  }

  return check;
}
