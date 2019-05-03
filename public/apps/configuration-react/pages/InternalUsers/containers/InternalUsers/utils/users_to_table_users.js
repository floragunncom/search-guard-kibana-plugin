import { reduce, omit, sortBy } from 'lodash';

const usersToTableUsers = allUsers => sortBy(reduce(allUsers, (result, user, id) => {
  result.push({ ...omit(user, ['hash']), id });
  return result;
}, []), ['id']);

export default usersToTableUsers;
