import { uiModules } from 'ui/modules';
import { merge } from 'lodash';
import { uniq } from 'lodash';
import client from './client';

/**
 * Roles API client service.
 */
uiModules.get('apps/kibi_access_control/configuration', [])
.service('backendRoles', function (backendAPI, Promise, $http, createNotifier) {

  const RESOURCE = 'roles';

  const notify = createNotifier({
    location: 'Roles'
  });

  this.title = {
    singular: 'Role',
    plural: 'Roles'
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
        icon: 'fa-list'
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

