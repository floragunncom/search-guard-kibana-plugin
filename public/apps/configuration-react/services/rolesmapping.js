import { uiModules } from 'ui/modules';
import { uniq } from 'lodash';

// TODO: refactor this service to JS
/**
 * Role mappings API client service.
 */
uiModules.get('apps/searchguardConfiguration', []).service('backendrolesmapping', function (backendAPI) {

  const RESOURCE = 'rolesmapping';

  this.title = {
    singular: 'role mapping',
    plural: 'role mappings'
  };

  this.newLabel = 'Search Guard Role';

  this.list = () => {
    return backendAPI.list(RESOURCE);
  };

  this.get = (id) => {
    return backendAPI.get(RESOURCE, id);
  };

  this.getSilent = (id) => {
    return backendAPI.getSilent(RESOURCE, id);
  };

  this.save = (actiongroupname, data) => {
    const newData = this.preSave(data);
    return backendAPI.save(RESOURCE, actiongroupname, newData);
  };

  this.delete = (id) => {
    return backendAPI.delete(RESOURCE, id);
  };

  this.emptyModel = () => {
    const rolemapping = {};
    rolemapping.users = [];
    rolemapping.hosts = [];
    rolemapping.backendroles = [];
    return rolemapping;
  };

  this.preSave = (rolemapping) => {
    rolemapping.users = this.cleanArray(rolemapping.users);
    rolemapping.backendroles = this.cleanArray(rolemapping.backendroles);
    rolemapping.hosts = this.cleanArray(rolemapping.hosts);

    if (rolemapping.hidden === false) {
      delete rolemapping.hidden;
    }

    if (rolemapping.readonly === false) {
      delete rolemapping.readonly;
    }

    if (typeof rolemapping.and_backendroles !== 'undefined') {
      delete rolemapping.and_backendroles;
    }

    return rolemapping;
  };

  this.postFetch = (rolemapping) => {
    rolemapping = backendAPI.cleanArraysFromDuplicates(rolemapping);
    return rolemapping;
  };

  this.cleanArray = (thearray) => {
    if (thearray && Array.isArray(thearray)) {
      // remove empty entries
      thearray = thearray.filter(e => String(e).trim());
      // remove duplicate entries
      thearray = uniq(thearray);
      return thearray;
    }
  };

});
