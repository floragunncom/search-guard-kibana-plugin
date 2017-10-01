import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';

const app = uiModules.get('apps/searchguard/configuration', []);



app.directive('sgLicenseWarning', function ($parse, $http, $sce, $timeout) {
    return {
        restrict: 'EA',
        scope: {
            "errorMessage": "@errormessage",
        },
        template: require('./licensewarning.html'),

        link: function($scope, elem, attrs) {

            const ROOT = chrome.getBasePath();
            const APP_ROOT = `${ROOT}`;
            const API_ROOT = `${APP_ROOT}/api/v1`;

            $scope.licensevalid = true;

            if ($scope.errorMessage) {
                $scope.message = $scope.errorMessage;
            } else {
                $scope.message = "The Search Guard license key is not valid for this cluster. Please contact your system administrator";
            }

            $http.get(`${API_ROOT}/systeminfo`)
                .then(
                (response) => {
                    $scope.systeminfo = response.data;
                    $scope.licensevalid = response.data.sg_license.is_valid;
                },
                (error) => {
                    $scope.licensevalid = false;
                    $scope.message = "Could not fetch Search Guard license information: " + error.data.message +". Please contact your System Administrator.";
                }
            );

        }
    }
});
