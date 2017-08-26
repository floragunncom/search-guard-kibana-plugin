import { uiModules } from 'ui/modules'
import { get } from 'lodash';
import client from '../../backend_api/sgconfiguration';

const app = uiModules.get('apps/searchguard/configuration', []);

app.controller('sgConfigController', function ($scope, $element, $route, createNotifier, sgConfiguration, kbnUrl) {



    $scope.service = sgConfiguration;
    $scope.authcnames = [];
    $scope.resource = {};

    $scope.title = "Manage Search Guard configuration";

    $scope.service.list().then(function (response) {

        $scope.resource = response.data;

        var sortedAuthcNames = [];

        for (var authc in response.data.searchguard.dynamic.authc) {
            sortedAuthcNames.push(authc);
        }

        $scope.authcnames = sortedAuthcNames.sort(function(a, b) {
            return a.order - b.order;
        });
    });
});
