import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';
import '../apps/configuration/systemstate'

const app = uiModules.get('apps/searchguard/configuration', []);



app.directive('sgLicenseWarning', function (systemstate) {
    return {
        restrict: 'EA',
        scope: {
            "errorMessage": "@errormessage",
        },
        template: require('./licensewarning.html'),

        link: function($scope, elem, attrs) {

            $scope.licensevalid = true;

            $scope.licensevalid = systemstate.licenseValid();

            if ($scope.errorMessage) {
                $scope.message = $scope.errorMessage;
            } else {
                $scope.message = "The Search Guard license key is not valid for this cluster. Please contact your system administrator";
            }

        }
    }
});
