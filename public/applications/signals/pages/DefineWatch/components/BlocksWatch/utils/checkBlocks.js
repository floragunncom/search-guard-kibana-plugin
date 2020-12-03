/* eslint-disable @kbn/eslint/require-license-header */
import { cloneDeep, defaultsDeep, pickBy, identity, omit } from 'lodash';
import uuid from 'uuid/v4';
import {
  stringifyPretty,
  arrayToComboBoxOptions,
  comboBoxOptionsToArray,
} from '../../../../../utils/helpers';

const COMMON_DEFAULTS = {
  name: '',
  target: '',
};

export const STATIC_DEFAULTS = {
  id: 0,
  response: '',
  type: 'static',
  name: 'static',
  value: {},
  ...COMMON_DEFAULTS,
};

export const HTTP_METHODS = arrayToComboBoxOptions(['GET', 'POST', 'PUT', 'DELETE']);

export const HTTP_DEFAULTS = {
  id: 0,
  response: '',
  type: 'http',
  name: 'http',
  isAuth: false,
  isTLS: false,
  request: {
    url: '',
    path: '', // optional
    query_params: '', // optional
    method: [],
    headers: '', // optional
    body: '', // optional,
    auth: {
      type: 'basic',
      username: '',
      password: '',
    }, // optional
  },
  tls: {
    trusted_certs: '',
    trust_all: false,
    verify_hostnames: false,
    client_auth: {
      certs: '',
      private_key: '',
      private_key_password: '',
    },
  }, // optional
  connection_timeout: 60, // s, optional
  read_timeout: 60, // s, optional
  ...COMMON_DEFAULTS,
};

export const SEARCH_DEFAULTS = {
  id: 0,
  response: '',
  type: 'search',
  name: 'search',
  request: {
    indices: [],
    body: {},
  },
  ...COMMON_DEFAULTS,
};

export const TRANSFORM_DEFAULTS = {
  id: 0,
  response: '',
  type: 'transform',
  name: 'transform',
  source: '',
  lang: 'painless',
  ...COMMON_DEFAULTS,
};

export const CALC_DEFAULTS = {
  id: 0,
  response: '',
  type: 'calc',
  name: 'calc',
  source: '',
  ...COMMON_DEFAULTS,
};

export const CONDITION_DEFAULTS = {
  id: 0,
  response: '',
  type: 'condition',
  name: 'condition',
  source: '',
  lang: 'painless',
  ...COMMON_DEFAULTS,
};

const FORMIK_FIELDS_TO_OMIT = ['id', 'response'];

export function staticToFormikStatic(check = {}) {
  const formik = defaultsDeep(cloneDeep(check), STATIC_DEFAULTS);

  formik.value = stringifyPretty(formik.value);
  formik.id = uuid();
  formik.response = '';

  return formik;
}

export function formikStaticToStatic(check = {}) {
  return pickBy(
    {
      ...omit(check, FORMIK_FIELDS_TO_OMIT),
      value: JSON.parse(check.value),
    },
    identity
  );
}

export function searchToFormikSearch(check = {}) {
  const formik = defaultsDeep(cloneDeep(check), SEARCH_DEFAULTS);

  formik.request.body = stringifyPretty(formik.request.body);
  formik.request.indices = arrayToComboBoxOptions(formik.request.indices);
  formik.id = uuid();
  formik.response = '';

  return formik;
}

export function formikSearchToSearch({ request, ...rest }) {
  return pickBy(
    {
      ...omit(rest, FORMIK_FIELDS_TO_OMIT),
      request: {
        body: JSON.parse(request.body),
        indices: comboBoxOptionsToArray(request.indices),
      },
    },
    identity
  );
}

export function httpToFormikHttp(check = {}) {
  let formik = cloneDeep(check);

  if (formik.request.auth) {
    formik.isAuth = true;
  }

  if (formik.tls) {
    formik.isTLS = true;
  }

  formik = defaultsDeep(formik, HTTP_DEFAULTS);

  formik.request.headers = formik.request.headers ? stringifyPretty(formik.request.headers) : '';
  formik.request.query_params = formik.request.query_params
    ? stringifyPretty(formik.request.query_params)
    : '';
  formik.request.method = arrayToComboBoxOptions([formik.request.method]);
  formik.id = uuid();
  formik.response = '';

  return formik;
}

export function formikHttpToHttp({ request, ...rest }) {
  const check = pickBy(
    {
      ...omit(rest, FORMIK_FIELDS_TO_OMIT),
      request: pickBy(request, identity),
    },
    identity
  );

  check.request.method = comboBoxOptionsToArray(check.request.method)[0];

  if (check.request.headers) {
    check.request.headers = JSON.parse(check.request.headers);
  }

  if (check.request.query_params) {
    check.request.query_params = JSON.parse(check.request.query_params);
  }

  if (!check.isAuth) {
    delete check.request.auth;
  }

  if (!check.isTLS) {
    delete check.tls;
  } else {
    const trustAll = check.tls.trust_all;
    const verifyHostnames = check.tls.verify_hostnames;

    check.tls = pickBy(check.tls, identity);
    check.tls.trust_all = trustAll;
    check.tls.verify_hostnames = verifyHostnames;

    check.tls.client_auth = pickBy(check.tls.client_auth, identity);
    const isClientAuth = !!Object.keys(check.tls.client_auth).length;
    if (!isClientAuth) {
      delete check.tls.client_auth;
    }
  }

  delete check.isAuth;
  delete check.isTLS;

  return check;
}

export function transformToFormikTransform(check = {}) {
  const formik = defaultsDeep(cloneDeep(check), TRANSFORM_DEFAULTS);
  formik.id = uuid();
  formik.response = '';
  return formik;
}

export function formikTransformToTransform(check = {}) {
  return pickBy(omit(check, FORMIK_FIELDS_TO_OMIT), identity);
}

export function calcToFormikCalc(check = {}) {
  const formik = defaultsDeep(cloneDeep(check), CALC_DEFAULTS);
  formik.id = uuid();
  formik.response = '';
  return formik;
}

export function formikCalcToCalc(check = {}) {
  return pickBy(omit(check, FORMIK_FIELDS_TO_OMIT), identity);
}

export function conditionToFormikCondition(check = {}) {
  const formik = defaultsDeep(cloneDeep(check), CONDITION_DEFAULTS);
  formik.id = uuid();
  formik.response = '';
  return formik;
}

export function formikConditionToCondition(check = {}) {
  return pickBy(omit(check, FORMIK_FIELDS_TO_OMIT), identity);
}

export function buildFormikCheckBlock(check = {}) {
  let formik;

  switch (check.type) {
    case STATIC_DEFAULTS.type:
      formik = staticToFormikStatic(check);
      break;
    case HTTP_DEFAULTS.type:
      formik = httpToFormikHttp(check);
      break;
    case SEARCH_DEFAULTS.type:
      formik = searchToFormikSearch(check);
      break;
    case TRANSFORM_DEFAULTS.type:
      formik = transformToFormikTransform(check);
      break;
    case CALC_DEFAULTS.type:
      formik = calcToFormikCalc(check);
      break;
    case CONDITION_DEFAULTS.type:
      formik = conditionToFormikCondition(check);
      break;
    default:
      throw new Error(`The check type is not supported: ${check.type}`);
  }

  return formik;
}

export function buildCheckBlock(formik = {}) {
  let check;

  switch (formik.type) {
    case STATIC_DEFAULTS.type:
      check = formikStaticToStatic(formik);
      break;
    case HTTP_DEFAULTS.type:
      check = formikHttpToHttp(formik);
      break;
    case SEARCH_DEFAULTS.type:
      check = formikSearchToSearch(formik);
      break;
    case TRANSFORM_DEFAULTS.type:
      check = formikTransformToTransform(formik);
      break;
    case CALC_DEFAULTS.type:
      check = formikCalcToCalc(formik);
      break;
    case CONDITION_DEFAULTS.type:
      check = formikConditionToCondition(formik);
      break;
    default:
      throw new Error(`The check type is not supported: ${check.type}`);
  }

  return check;
}
