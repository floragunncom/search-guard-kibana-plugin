import { isNumber } from 'lodash';

export function getFieldsFromPayload(data = {}) {
  const result = {};

  function flattenJson(curr, prop = '') {
    if (typeof curr !== 'object' || !curr) {
      result[prop] = curr;
    } else if (Array.isArray(curr)) {
      if (!curr.length) result[prop] = [];
      for (let i = 0; i < curr.length; i++) {
        const childProp = `${prop}[${i}]`;
        flattenJson(curr[i], childProp);
      }
    } else if (typeof curr === 'object' && curr !== null) {
      for (const key in curr) {
        if (Object.prototype.hasOwnProperty.call(curr, key)) {
          const childProp = prop ? `${prop}.${key}` : key;
          flattenJson(curr[key], childProp);
        }
      }
    }
  }

  flattenJson(data);
  return result;
}

export function getFieldsForType(data = {}, type = 'number') {
  const res = [];

  if (type === 'number') {
    Object.keys(data).forEach(key => {
      if (isNumber(data[key])) {
        res.push(key);
      }
    });

    return res;
  }

  return Object.keys(data);
}
