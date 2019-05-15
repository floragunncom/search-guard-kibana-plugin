import { reduce, sortBy, omit } from 'lodash';
import { isSinglePermission } from '../../../utils/helpers';

export const enrichResource = values => {
  const { permissions = [], actiongroups = [] } = values;

  if (Array.isArray(values.allowed_actions)) {
    values.allowed_actions.forEach(action => {
      if (isSinglePermission(action)) {
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
