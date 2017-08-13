import { uiModules } from 'ui/modules';
import '../angucomplete';

const app = uiModules.get('apps/searchguard/configuration', []);

app.directive('sgcPermissions', function () {
    return {
        template: require('./permissions.html'),
        restrict: 'EA',
        scope: {
            "permissionsResource": "=permissionsresource",
        },
        controller: 'sgBaseController'
    }
});
