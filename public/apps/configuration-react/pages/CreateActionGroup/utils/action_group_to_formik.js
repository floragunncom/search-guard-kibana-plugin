import { enrichResource } from '../../ActionGroups/utils';

const actionGroupToFormik = (actionGroup, id = '') => {
  const { permissions, actiongroups } = enrichResource(actionGroup);
  return {
    name: id,
    isAdvanced: false,
    permissions: permissions.map(label => ({ label })),
    actiongroups: actiongroups.map(label => ({ label }))
  };
};
export default actionGroupToFormik;
