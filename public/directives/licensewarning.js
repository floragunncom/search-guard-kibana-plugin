import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';

require ('../apps/configuration/systemstate/systemstate');

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
            $scope.message = "";

            systemstate.loadSystemInfo().then(function(){

                if (!systemstate.licenseRequired()) {
                    $scope.licensevalid = true;
                    return;
                }

                $scope.licensevalid = systemstate.licenseValid();

                if ($scope.errorMessage) {
                    $scope.message = $scope.errorMessage;
                } else {
                    $scope.message = "The Search Guard license key is not valid for this cluster. Please contact your system administrator.";
                }

                if (systemstate.licenseValid()) {
                    if (systemstate.isTrialLicense() && systemstate.expiresIn() <= 10) {
                        $scope.hint = "Your trial license expires in " + systemstate.expiresIn() + " days.";
                        $scope.$apply('hint');
                    }
                    if (!systemstate.isTrialLicense() && systemstate.expiresIn() <= 20) {
                        $scope.hint = "Your license expires in " + systemstate.expiresIn() + " days.";
                        $scope.$apply('hint');
                    }

                }
            });

        }
    }
});
