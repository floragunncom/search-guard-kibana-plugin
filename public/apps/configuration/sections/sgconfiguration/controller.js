import { uiModules } from 'ui/modules'
import { get } from 'lodash';
import { forEach } from 'lodash';
import client from '../../backend_api/sgconfiguration';

const app = uiModules.get('apps/searchguard/configuration', []);

app.controller('sgConfigController', function ($scope, $element, $route, createNotifier, sgConfiguration, kbnUrl) {

    $scope.endpoint = "SGCONFIG";

    $scope.service = sgConfiguration;
    $scope.sortedAuthc = [];
    $scope.sortedAuthz = [];
    $scope.resource = {};

    $scope.title = "Authentication / Authorization configuration";

    $scope.service.list().then(function (response) {

        $scope.resource = response.data;

        forEach(response.data.searchguard.dynamic.authc, function(value, key) {
            value["name"] = key;
            $scope.sortedAuthc.push(value);
        });

        forEach(response.data.searchguard.dynamic.authz, function(value, key) {
            value["name"] = key;
            $scope.sortedAuthz.push(value);
        });

        $scope.sortedAuthc = $scope.sortedAuthc.sort(function(a, b) {
            return a.order - b.order;
        });

    });

    $scope.authctitle = function(authc)  {
        console.log("lu");
        var title = authc.order + ": " + authc.name;
        var enabled = authc.http_enabled && authc.http_enabled == "true" && authc.transport_enabled && authc.transport_enabled == "true";
        if(!enabled) {
            title += " (disabled)";
        }
        return title;
    }
    $scope.authcclass = function(authc)  {
        var enabled = authc.http_enabled && authc.http_enabled == "true" && authc.transport_enabled && authc.transport_enabled == "true";
        if(!enabled) {
            return "authc-disabled";
        }
    }

});
