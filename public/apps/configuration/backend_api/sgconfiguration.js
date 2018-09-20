import { uiModules } from 'ui/modules';
import client from './client';

/**
 * SG configuration client service.
 */
uiModules.get('apps/searchguard/configuration', [])
    .service('sgConfiguration', function (backendAPI, Promise, $http) {

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
