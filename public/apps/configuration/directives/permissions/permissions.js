import { uiModules } from 'ui/modules';
import '../angucomplete';

const app = uiModules.get('apps/searchguard/configuration', []);

app.directive('sgcPermissions', function () {
    return {
        template: require('./permissions.html'),
        restrict: 'EA',
        scope: true,
        scope: {
            "permissionsResource": "=permissionsresource",
        },
        controller: 'sgBaseController',
        link: function(scope, elem, attr) {

            scope.showAdvanced = null;

            scope.$watch('permissionsResource', function(newValue, oldValue){
                if(newValue && (scope.showAdvanced == null)) {
                    if (scope.permissionsResource.permissions && scope.permissionsResource.permissions.length > 0) {
                        scope.showAdvanced = true;
                    }
                }
            }, true)


        }
    }
});
