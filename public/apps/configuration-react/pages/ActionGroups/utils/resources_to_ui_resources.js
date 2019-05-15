import { reduce, sortBy, omit } from 'lodash';

const resourcesToUiResources = resources => sortBy(reduce(resources, (result, values, id) => {
  const permissions = [];
  const actiongroups = [];

  values.allowed_actions.forEach(action => {
    if (action.startsWith('cluster:') || action.startsWith('indices:')) {
      permissions.push(action);
    } else {
      actiongroups.push(action);
    }
  });

  result.push({ id, permissions, actiongroups, ...omit(values, ['allowed_actions']) });
  return result;
}, []), 'id');

export default resourcesToUiResources;
