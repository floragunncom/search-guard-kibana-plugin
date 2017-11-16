import { uiModules } from 'ui/modules';
import { get } from 'lodash';
import client from './backend_api/client';
import './directives/directives';
import '../../directives/licensewarning'

const app = uiModules.get('apps/searchguard/configuration', ['ui.ace']);

app.controller('searchguardConfigurationController', function ($scope, $element, $route, $window, $http, createNotifier, backendAPI) {

    $scope.errorMessage = "";

    $scope.title = "Search Guard Configuration";

    $scope.clearCache = function() {
        backendAPI.clearCache();
    }

});
