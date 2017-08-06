import { uiModules } from 'ui/modules';
import { merge } from 'lodash';
import { uniq } from 'lodash';


/**
 * Role mappings API client service.
 */
uiModules.get('apps/kibi_access_control/configuration', [])
.service('backendRoleMappings', function (backendAPI, Promise, $http, createNotifier) {

  const RESOURCE = 'rolemappings';

  const notify = createNotifier({
    location: 'Role mappings'
  });

  this.title = {
    singular: 'Role mapping',
    plural: 'Role mappings'
  };

  this.get = (id) => {
    return backendAPI.get(RESOURCE, id);
  };

  this.create = (data) => {
    return backendAPI.create(RESOURCE, data);
  };

  this.update = (id, data) => {
    return backendAPI.update(RESOURCE, id, data);
  };

  this.delete = (id) => {
    return backendAPI.delete(RESOURCE, id);
  };

  this.find = (searchString) => {
    return backendAPI.list(RESOURCE)
    .then((response) => {
      return response.data.hits.hits
      .map((hit) => (merge(hit, {
        description: hit.id,
        icon: 'fa-group'
      })))
      .filter((hit) => {
        return searchString ? hit.id.match(searchString) : true;
      });
    })
    .catch((error) => {
      notify.error(error);
      throw error;
    });
  };

});

