import { uiModules } from 'ui/modules';
import client from './client';

/**
 * SG configuration client service.
 */
uiModules.get('apps/searchguard/configuration', [])
    .service('sgConfiguration', function (backendAPI, Promise, $http, createNotifier) {

        const RESOURCE = 'config';

        const notify = createNotifier({
            location: 'Authentication Configuration'
        });

        this.title = {
            singular: 'Authentication',
            plural: 'Authentication'
        };

        this.list = () => {
            return backendAPI.list(RESOURCE);
        };


        this.postFetch = (sgconfig) => {



            return rolemapping;
        };

    });
