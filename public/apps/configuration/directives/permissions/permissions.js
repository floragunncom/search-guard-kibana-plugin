import { uiModules } from 'ui/modules';
import '../angucomplete/angucomplete';

const app = uiModules.get('apps/searchguard/configuration', []);

app.directive('sgcPermissions', function () {
    return {
        template: require('./permissions.html'),
        restrict: 'EA',
        scope: {
            "permissionsResource": "=permissionsresource",
            'onShouldConfirm': '&',
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

            /**
             * Since we have an isolated scope, we can't modify the parent scope without breaking
             * the binding. Hence, we pass the parent scope's handler to this directive.
             *
             * An alternative could be to encapsulate the delete logic in a service.
             *
             * @param {array} source
             * @param {string} item
             */
            scope.confirmDeletePermission = function(source, item) {
                scope.onShouldConfirm()(source, item);
            };


        }
    }
});
