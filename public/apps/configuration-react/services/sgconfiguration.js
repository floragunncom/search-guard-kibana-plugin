import { uiModules } from 'ui/modules';

// TODO: refactor this service to JS
/**
 * SG configuration client service.
 */
uiModules.get('apps/searchguardConfiguration', []).service('sgConfiguration', function (backendAPI) {

  const RESOURCE = 'sgconfig';

  this.title = {
    singular: 'Authentication / Authorization configuration',
    plural: 'Authentication / Authorization configuration'
  };

  this.list = () => {
    return backendAPI.list(RESOURCE);
  };


  this.postFetch = (sgconfig) => {
    return sgconfig;
  };

});
