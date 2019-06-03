import { isObject, reduce } from 'lodash';

const getCorrespondingRoles = (allRoleMappings = {}, rolesService) => {
  const roles = Object.keys(allRoleMappings);
  const promisses = [];
  for (const roleName of roles) {
    promisses.push(rolesService.get(roleName));
  }

  return Promise.all(
    promisses.map((promise, i) => promise
      .then(resp => ({ role: roles[i], exists: isObject(resp) }))
      .catch(error => {
        if (error.status === 404) return { role: roles[i], exist: false };
        throw error;
      })
    )
  ).then(resp => {
    return reduce(resp, (result, { role, exists }) => {
      result[role] = !!exists;
      return result;
    }, {});
  }).catch(error => {
    const message = 'Fail to check corresponding roles!';
    error.message = !error.message ? message : (message + ' ' + error.message);
    throw error;
  });
};

export default getCorrespondingRoles;
