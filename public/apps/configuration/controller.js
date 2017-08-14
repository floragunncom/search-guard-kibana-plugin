import { uiModules } from 'ui/modules';
import { get } from 'lodash';


const app = uiModules.get('apps/searchguard/configuration', ['ui.ace']);

app.controller('searchguardConfigurationMainController', function ($scope, $element, $route, createNotifier, backendActionGroups, kbnUrl) {

    $scope.title = "Search Guard Configuration";

    console.log("In Main Controller");
});
