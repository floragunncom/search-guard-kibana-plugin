import { uiModules } from 'ui/modules';
import { uniq } from 'lodash';

// TODO: refactor this service to JS
/**
 * Internal users API client service.
 */
uiModules.get('apps/searchguardConfiguration', []).service('backendInternalUsers', function (backendAPI) {

  const RESOURCE = 'internalusers';

  this.title = {
    singular: 'internal user',
    plural: 'internal users'
  };

  this.newLabel = 'Username';

  this.list = () => {
    return backendAPI.list(RESOURCE);
  };

  this.get = (username) => {
    return backendAPI.get(RESOURCE, username);
  };

  this.save = (username, data, doPreSave = true) => {
    const newData = doPreSave ? this.preSave(data) : data;
    return backendAPI.save(RESOURCE, username, newData);
  };

  this.delete = (username) => {
    return backendAPI.delete(RESOURCE, username);
  };

  this.emptyModel = () => {
    const user = {};
    user.password = '';
    user.passwordConfirmation = '';
    user.roles = [];
    user.attributesArray = [];
    return user;
  };

  this.preSave = (user) => {

    if (user.hidden === false) {
      delete user.hidden;
    }

    if (user.readonly === false) {
      delete user.readonly;
    }

    delete user.passwordConfirmation;
    // remove empty roles
    user.roles = user.roles.filter(e => String(e).trim());
    // remove duplicate roles
    user.roles = uniq(user.roles);

    // attribiutes
    user.attributes = {};
    for (let i = 0, l = user.attributesArray.length; i < l; i++) {
      const entry = user.attributesArray[i];
      if (entry && entry.key !== '') {
        user.attributes[entry.key] = entry.value;
      }
    }
    delete user.attributesArray;
    return user;
  };

  this.postFetch = (user) => {
    user = backendAPI.cleanArraysFromDuplicates(user);
    delete user.hash;
    user.password = '';
    user.passwordConfirmation = '';
    if (!user.roles) {
      user.roles = [];
    }
    // transform user attributes to object
    user.attributesArray = [];
    if (user.attributes) {
      const attributeNames = Object.keys(user.attributes).sort();
      attributeNames.forEach(function (attributeName) {

        user.attributesArray.push(
          {
            key: attributeName,
            value: user.attributes[attributeName]
          }
        );
      });
    }
    return user;
  };

});
