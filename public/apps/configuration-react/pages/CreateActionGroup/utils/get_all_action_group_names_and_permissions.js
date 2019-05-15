import { reduce, sortBy, uniqBy } from 'lodash';
import { enrichResource } from '../../ActionGroups/utils';

const getAllActionGroupNamesAndPermissions = (actionGroups, currentGroup) => {
  const { allSinglePermissions, allActionGroups } = reduce(actionGroups, (result, values, label) => {
    if (label !== currentGroup) {
      result.allActionGroups.push({ label });
    }

    const { permissions } = enrichResource(values);
    permissions.forEach(label => {
      result.allSinglePermissions.push({ label });
    });

    return result;
  }, { allSinglePermissions: [], allActionGroups: [] });

  return {
    allActionGroups: sortBy(allActionGroups, ['label']),
    allSinglePermissions: uniqBy(sortBy(allSinglePermissions, ['label']), 'label')
  };
};

export default getAllActionGroupNamesAndPermissions;
