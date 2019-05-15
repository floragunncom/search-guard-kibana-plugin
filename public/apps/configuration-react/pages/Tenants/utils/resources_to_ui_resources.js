import { reduce, sortBy } from 'lodash';

const resourcesToUiResources = resources => sortBy(reduce(resources, (result, values, id) => {
  result.push({ id, ...values });
  return result;
}, []), 'id');

export default resourcesToUiResources;
