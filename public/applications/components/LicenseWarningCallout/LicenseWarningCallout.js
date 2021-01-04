/* eslint-disable @kbn/eslint/require-license-header */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { EuiCallOut, EuiText, EuiSpacer, EuiErrorBoundary } from '@elastic/eui';
import { isEmpty } from 'lodash';
import { licenseCantBeLoadedText, licenseKeyIsInvalidText, licenseExpiresInText, trialLicenseExpiresInText } from './i18n';
export function LicenseWarningCallout({ configService, errorMessage }) {
  const service = configService;

  const [licenseValid, setLicenseValid] = useState(true);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  useState(() => {
    verifyLicense();
  }, []);

  async function verifyLicense() {
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

      const isLicenseValid = service.licenseValid();
      setLicenseValid(isLicenseValid);

      if (errorMessage) {
        setError(errorMessage);
      } else {
        setError(licenseKeyIsInvalidText);
      }

      const isTrialLicense = service.isTrialLicense();
      const licenseExpiresInDays = service.licenseExpiresIn();

      if (isLicenseValid) {
        if (isTrialLicense && licenseExpiresInDays <= 10) {
          setWarning(trialLicenseExpiresInText(licenseExpiresInDays));
        }
        if (!isTrialLicense && service.licenseExpiresIn() <= 20) {
          setWarning(licenseExpiresInText(licenseExpiresInDays));
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
