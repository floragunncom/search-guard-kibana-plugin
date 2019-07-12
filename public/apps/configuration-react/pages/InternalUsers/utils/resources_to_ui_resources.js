import { reduce, omit, sortBy } from 'lodash';

const resourcesToUiResources = allUsers => sortBy(reduce(allUsers, (result, user, id) => {
  result.push({ ...omit(user, ['hash']), _id: id });
  return result;
}, []), ['_id']);

export default resourcesToUiResources;
