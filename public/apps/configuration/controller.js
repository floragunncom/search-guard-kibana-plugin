import { uiModules } from 'ui/modules';
import { get } from 'lodash';


const app = uiModules.get('apps/searchguard/configuration', []);

app.controller('searchguardConfigurationMainController', function ($scope, $element, $route, createNotifier, backendActionGroups, kbnUrl) {

    $scope.title = "Search Guard Configuration";

});
