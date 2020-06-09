/* eslint-disable @kbn/eslint/require-license-header */
import { cloneDeep, defaultsDeep, pickBy, identity, omit } from 'lodash';
import uuid from 'uuid/v4';
import { stringifyPretty } from '../../../../../utils/helpers';

const COMMON_DEFAULTS = {
  name: '',
  target: '',
};

export const STATIC_DEFAULTS = {
  id: 0,
  response: '',
  type: 'static',
  value: {},
  ...COMMON_DEFAULTS,
};

export const HTTP_DEFAULTS = {
  id: 0,
  response: '',
  type: 'http',
  request: {},
  tls: {},
  ...COMMON_DEFAULTS,
};

export const SEARCH_DEFAULTS = {
  id: 0,
  response: '',
  type: 'search',
  request: {},
  ...COMMON_DEFAULTS,
};

export const TRANSFORM_DEFAULTS = {
  id: 0,
  response: '',
  type: 'transform',
  source: '',
  lang: 'painless',
  ...COMMON_DEFAULTS,
};

export const CALC_DEFAULTS = {
  id: 0,
  response: '',
  type: 'calc',
  source: '',
  ...COMMON_DEFAULTS,
};

export const CONDITION_DEFAULTS = {
  id: 0,
  response: '',
  type: 'condition',
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

  formik.value = stringifyPretty(formik.request);
  delete formik.request;
  formik.id = uuid();
  formik.response = '';

  return formik;
}

export function formikSearchToSearch({ value, ...rest }) {
  return pickBy(
    {
      ...omit(rest, FORMIK_FIELDS_TO_OMIT),
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
  formik.id = uuid();
  formik.response = '';

  return formik;
}

export function formikHttpToHttp({ value, ...rest }) {
  const check = pickBy(
    {
      ...omit(rest, FORMIK_FIELDS_TO_OMIT),
      request: JSON.parse(value),
    },
    identity
  );

  if (check.tls) {
    check.tls = JSON.parse(check.tls);
  }

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

  switch (check.type) {
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
