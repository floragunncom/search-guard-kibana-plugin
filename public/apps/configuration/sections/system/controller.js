import chrome from 'ui/chrome';
import { uiModules } from 'ui/modules'
import { get } from 'lodash';
import { forEach } from 'lodash';
import { Notifier } from 'ui/notify/notifier';

const app = uiModules.get('apps/searchguard/configuration', []);

app.controller('sgSystemController', function ($scope, $http, $route, $element, createNotifier, kbnUrl) {

    $scope.endpoint = "system";
    $scope.$parent.endpoint = "system";

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

    $scope.new = () => {
        kbnUrl.change('system/license/new/');
    }
});
app.controller('sgLicenseController', function ($scope, $element, $route, $location, $routeParams, $http, kbnUrl) {

    $scope.endpoint = "system";
    $scope.$parent.endpoint = "system";

    $scope.resource = {
        licenseString: ""
    };

    var APP_ROOT = `${chrome.getBasePath()}`;
    var API_ROOT = `${APP_ROOT}/api/v1`;
    let notify = new Notifier({});

    $scope.title = function () {
        return "Upload new license";
    }

    $scope.saveObject = (event) => {

        if (event) {
            event.preventDefault();
        }

        const form = $element.find('form[name="objectForm"]');

        if (form.hasClass('ng-invalid-required')) {
            $scope.errorMessage = 'Please fill in all the required parameters.';
            return;
        }

        if (!form.hasClass('ng-valid')) {
            $scope.errorMessage = 'Please correct all errors and try again.';
            return;
        }

        var licenseAsJson = {
            sg_license: $scope.resource.licenseString
        };


        $http.post(`${API_ROOT}/license`, licenseAsJson)
            .then(
            (response) => {
                notify.info(response.data.message);
                kbnUrl.change(`/system/`)
            })
            .catch((error) => {
                console.log(error);
                notify.error(error);
            });
    };
});


