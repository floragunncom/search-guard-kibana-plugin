import { uiModules } from 'ui/modules';
import { get } from 'lodash';
import client from './backend_api/client';
import './directives/directives';
import { readFileSync } from 'fs';

const app = uiModules.get('apps/searchguard/configuration', ['ui.ace']);

app.controller('searchguardConfigurationMainController', function ($scope, $element, $route, $window, $http, createNotifier, backendAPI) {


    $scope.authenticationForm = {};

    $scope.authenticated = true;

    $scope.errorMessage = "";

    $scope.testConnection = () => {

        var certificates = sessionStorage.getItem('searchguard_certificates');
        if (!certificates || certificates == null || certificates.length == null) {
            $scope.authenticated = false;
        } else {
            backendAPI.testConnection()
                .then((response) => {

                    if (response == 200) {
                        $scope.authenticated = true;
                        $scope.errorMessage = "";
                    } else {
                        sessionStorage.removeItem('searchguard_certificates');
                        $scope.errorMessage = "Invalid certificates, please try again."
                        $scope.authenticated = false;
                    }
                });
        }
    };

    $scope.title = function () {
        return $scope.authenticated? "Search Guard Configuration" : "Please authenticate.";
    }

    $scope.authenticateAdmin = (event) => {

        if (event) {
            event.preventDefault();
        }

        // todo: encrypt?
        var formContent = JSON.stringify($scope.authenticationForm);

        sessionStorage.setItem('searchguard_certificates', formContent);

        $scope.testConnection();
    };

    $scope.logoutAdmin = () => {
        sessionStorage.removeItem('searchguard_certificates');
        $scope.authenticationForm = {};
        $scope.errorMessage = "";
        $scope.testConnection();
    };

    $scope.clearCache = function() {
        backendAPI.clearCache();
    }


    $scope.testConnection();

});
