import { uiModules } from 'ui/modules'
import { get } from 'lodash';
import { forEach } from 'lodash';
import client from '../../backend_api/sgconfiguration';

const app = uiModules.get('apps/searchguard/configuration', []);

app.controller('sgConfigController', function ($scope, $element, $route, createNotifier, sgConfiguration, kbnUrl) {

    console.log("controller");

    $scope.service = sgConfiguration;
    $scope.sortedAuthc = [];
    $scope.resource = {};

    $scope.title = "Manage Search Guard configuration";

    $scope.service.list().then(function (response) {

        $scope.resource = response.data;

        forEach(response.data.searchguard.dynamic.authc, function(value, key) {
            value["name"] = key;
            $scope.sortedAuthc.push(value);
        });
        $scope.sortedAuthc = $scope.sortedAuthc.sort(function(a, b) {
            return a.order - b.order;
        });

    });
});
