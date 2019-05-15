import { reduce, sortBy, omit } from 'lodash';

export const enrichResource = values => {
  const permissions = [];
  const actiongroups = [];

  if (Array.isArray(values.allowed_actions)) {
    values.allowed_actions.forEach(action => {
      if (action.startsWith('cluster:') || action.startsWith('indices:')) {
        permissions.push(action);
      } else {
        actiongroups.push(action);
      }
    });
  }

  return { permissions, actiongroups, ...omit(values, ['allowed_actions']) };
};

export const resourcesToUiResources = resources => sortBy(reduce(resources, (result, values, id) => {
  result.push(enrichResource({ ...values, id }));
  return result;
}, []), 'id');
