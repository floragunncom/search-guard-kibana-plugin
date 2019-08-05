import { reduce, sortBy } from 'lodash';

const resourcesToUiResources = resources => sortBy(reduce(resources, (result, values, id) => {
  result.push({ _id: id, ...values });
  return result;
}, []), '_id');

export default resourcesToUiResources;
