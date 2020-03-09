import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';
import template from './licensewarning.html';
import { SystemStateService } from '../services';

const app = uiModules.get('apps/searchguard/configuration', []);

app.directive('sgLicenseWarning', function ($http) {
    console.log($http);
    const systemStateService = new SystemStateService($http);

    return {
        restrict: 'EA',
        scope: {
            "errorMessage": "@errormessage",
        },
        template,

        link: function($scope, elem, attrs) {

            $scope.licensevalid = true;
            $scope.message = "";

            systemStateService.loadSystemInfo().then(function(){

                if (!systemStateService.stateLoaded()) {
                    $scope.message = "The Search Guard license information could not be loaded. Please contact your system administrator.";
                    $scope.licensevalid = false;
                    $scope.$apply('message');
                    return;
                }


                if (!systemStateService.licenseRequired()) {
                    $scope.licensevalid = true;
                    return;
                }

                $scope.licensevalid = systemStateService.licenseValid();

                if ($scope.errorMessage) {
                    $scope.message = $scope.errorMessage;
                } else {
                    $scope.message = "The Search Guard license key is not valid for this cluster. Please contact your system administrator.";
                }

                if (systemStateService.licenseValid()) {
                    if (systemStateService.isTrialLicense() && systemStateService.expiresIn() <= 10) {
                        $scope.hint = "Your trial license expires in " + systemStateService.expiresIn() + " days.";
                        $scope.$apply('hint');
                    }
                    if (!systemStateService.isTrialLicense() && systemStateService.expiresIn() <= 20) {
                        $scope.hint = "Your license expires in " + systemStateService.expiresIn() + " days.";
                        $scope.$apply('hint');
                    }

                }
            });

        }
    }
});
