/* eslint-disable @kbn/eslint/require-license-header */
import { uiModules } from 'ui/modules';
import React from 'react';
import { render } from 'react-dom';
import { LicenseWarningCallout } from '../apps/components';

const app = uiModules.get('apps/searchguard/configuration', []);

app.directive('sgLicenseWarning', $http => {
  return {
    restrict: 'EA',
    scope: {
      errorMessage: '@errormessage',
    },
    link: function(scope, el) {
      scope.$watch('errorMessage', function(newValue) {
        const licenseWarning = React.createFactory(LicenseWarningCallout);
        render(licenseWarning({ errorMessage: newValue, httpClient: $http }), el[0]);
      });
    },
  };
});
