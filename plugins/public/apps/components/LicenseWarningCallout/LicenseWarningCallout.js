/* eslint-disable @kbn/eslint/require-license-header */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { EuiCallOut, EuiText, EuiSpacer, EuiErrorBoundary } from '@elastic/eui';
import { isEmpty } from 'lodash';

export function LicenseWarningCallout({ configService, errorMessage }) {
  const service = configService;

  const [licenseValid, setLicenseValid] = useState(true);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  useState(() => {
    verifyLicense();
  }, []);

  async function verifyLicense() {
    const licenseCantBeLoadedText =
      'The Search Guard license information could not be loaded. Please contact your system administrator.';
    const licenseKeyIsInvalidText =
      'The Search Guard license key is not valid for this cluster. Please contact your system administrator.';

    try {
      if (isEmpty(service.get('systeminfo'))) {
        setError(licenseCantBeLoadedText);
        setLicenseValid(false);
        return;
      }

      if (!service.licenseRequired()) {
        setLicenseValid(true);
        return;
      }

      setLicenseValid(service.licenseValid());

      if (errorMessage) {
        setError(errorMessage);
      } else {
        setError(licenseKeyIsInvalidText);
      }

      if (service.licenseValid()) {
        if (service.isTrialLicense() && service.licenseExpiresIn() <= 10) {
          setWarning(`Your trial license expires in ${service.licenseExpiresIn()} days.`);
        }
        if (!service.isTrialLicense() && service.licenseExpiresIn() <= 20) {
          setWarning(`Your license expires in ${service.licenseExpiresIn()} days.`);
        }
      }
    } catch (error) {
      setLicenseValid(false);
      setError(licenseCantBeLoadedText);
      console.error('LicenseWarning - checkLicense()', error);
    }
  }

  return (
    <EuiErrorBoundary>
      {!licenseValid && (
        <>
          <EuiCallOut
            id="sg.label.licensewarning"
            data-test-subj="sg.callout.licenseWarning"
            title="Error"
            color="danger"
            iconType="alert"
          >
            <EuiText>
              <p>{error}</p>
            </EuiText>
          </EuiCallOut>
          <EuiSpacer />
        </>
      )}

      {warning && (
        <>
          <EuiCallOut
            id="sg.label.licensehint"
            data-test-subj="sg.callout.licenseHint"
            title="Warning"
            color="warning"
            iconType="help"
          >
            <EuiText>
              <p>{warning}</p>
            </EuiText>
          </EuiCallOut>
          <EuiSpacer />
        </>
      )}
    </EuiErrorBoundary>
  );
}

LicenseWarningCallout.defaultProps = {
  errorMessage: '',
};

LicenseWarningCallout.propTypes = {
  configService: PropTypes.object,
  errorMessage: PropTypes.string,
};
