import { uiModules } from 'ui/modules';
import { get } from 'lodash';
import client from './backend_api/client';

const app = uiModules.get('apps/searchguard/configuration', ['ui.ace']);

app.controller('searchguardConfigurationMainController', function ($scope, $element, $route, createNotifier, backendAPI, kbnUrl) {

    $scope.title = "Search Guard Configuration";

    $scope.certificate = "";
    $scope.key = "";
    $scope.keyPassword = "";

    $scope.authenticated = true;

    $scope.authenticate = (event) => {
        if (event) {
            event.preventDefault();
        }
    };

    $scope.clearCache = function() {
        backendAPI.clearCache();
    }
});
