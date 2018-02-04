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
    const form = $element.find('form[name="objectForm"]');
    const fileField = $element.find('#js-uploadLicenseFile')[0];
    /**
     * Sanity check for the uploaded license file - maximum file size in bytes.
     * @type {number}
     */
    const licenseFileLimit = 5000;


    $scope.title = function () {
        return "Upload new license";
    };

    /**
     * Handle an uploaded license file
     * @param event
     */
    function uploadLicenseFile(event) {

        if (! event.target.files.length) {
            return;
        }

        const allowedFileExtensions = ['.txt', '.lic'];

        let file = event.target.files[0];
        let fileNameParts = file.name.split('.');
        // We only allow .txt and .lic in the html, but let's do a simple check here too
        let fileExtension = '.' + fileNameParts[fileNameParts.length - 1];

        if (allowedFileExtensions.indexOf(fileExtension) === -1) {
            notify.error('Please select another file. We support the following file extensions: ' + allowedFileExtensions.join(', '));

            return;
        }

        if (file.size > licenseFileLimit) {
            notify.error('The file is larger than a typical license file. Please paste the content of the file into the text field.');

            return;
        }

        let fileReader = new FileReader();

        /**
         * Triggered after the FileReader has read the file
         * @param event
         */
        fileReader.onload = function(event) {
            if (event.target.result) {
                $scope.resource.licenseString = event.target.result;
                $scope.$apply('resource');
                form.submit();
            }
        };

        fileReader.onerror = function (event) {
            notify.error('Something went wrong with the uploaded file. Please paste the content of the file into the text field.');
        };

        fileReader.readAsText(file);
    }

    // Angular doesn't handle the ng-change event on input type="file"
    fileField.addEventListener('change', uploadLicenseFile);


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
                sessionStorage.removeItem("systeminfo");
                notify.info(response.data.message);
                kbnUrl.change(`/system/`)
            })
            .catch((error) => {
                notify.error(error);
            });
    };

    /**
     * Clean up when the $scope is destroyed
     */
    $scope.$on('$destroy', function () {
        fileField.removeEventListener('change', uploadLicenseFile);
    });
});


