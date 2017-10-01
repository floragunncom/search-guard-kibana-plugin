import chrome from 'ui/chrome';
import { uiModules } from 'ui/modules'
import { get } from 'lodash';
import { forEach } from 'lodash';
import { Notifier } from 'ui/notify/notifier';

const app = uiModules.get('apps/searchguard/configuration', []);

app.controller('sgSystemController', function ($scope, $http, $route, $element, createNotifier, kbnUrl) {

    var APP_ROOT = `${chrome.getBasePath()}`;
    var API_ROOT = `${APP_ROOT}/api/v1`;
    let notify = new Notifier({});

    $scope.title = "Search Guard System Status";

    $http.get(`${API_ROOT}/systeminfo`)
        .then(
        (response) => {
            $scope.systeminfo = response.data;
            var moduleKey = Object.keys(response.data.modules)[0];
            $scope.modules = response.data.modules[moduleKey];
        },
        (error) => notify.error(error)
    );

});
