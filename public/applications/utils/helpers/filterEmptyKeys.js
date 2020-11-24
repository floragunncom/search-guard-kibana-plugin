import { isEmpty } from 'lodash';

export const filterEmptyKeys = (obj = {}) => Object.keys(obj).reduce((acc, key) => {
  if (typeof obj[key] === 'boolean' || typeof obj[key] === 'number' || !isEmpty(obj[key])) {
    acc[key] = obj[key];
  }
  return acc;
}, {});
