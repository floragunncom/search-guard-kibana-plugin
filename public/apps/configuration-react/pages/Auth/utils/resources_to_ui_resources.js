import { reduce, camelCase } from 'lodash';

const resourcesToUiResources = ({ authc, authz }) => {
  const enrichResources = resourceType => (res, value, key) => {
    const newKey = camelCase(key);
    res[newKey] = value;
    res[newKey].name = newKey;
    res[newKey].resourceType = resourceType;
    return res;
  };

  return {
    ...reduce(authc, enrichResources('authc'), {}),
    ...reduce(authz, enrichResources('authz'), {})
  };
};

export default resourcesToUiResources;
