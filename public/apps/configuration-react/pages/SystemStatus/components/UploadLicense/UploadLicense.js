import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import { EuiFilePicker, EuiFlexGroup, EuiFlexItem, EuiFormRow } from '@elastic/eui';
import {
  ContentPanel,
  FormikCodeEditor,
  CancelButton,
  SaveButton
} from '../../../../components';
import { APP_PATH } from '../../../../utils/constants';
import { SIDE_NAV } from '../../utils/constants';
import {
  uploadLicenseText,
  uploadLicenseFileText,
  uploadFileformatsText,
  licenseStringText,
  licenseWasUploadedSuccessfullyText,
  selectOrDragAndDropLicenseFileText,
  licenseFileCantBeImportedText
} from '../../../../utils/i18n/system_status';
import { validateTextField, isInvalid, hasError } from '../../../../utils/validation';
import { SystemService } from '../../../../services';
import { readFileAsText } from '../../../../utils/helpers';

const LicenseEditor = () => (
  <FormikCodeEditor
    name="license"
    formRow
    formikFieldProps={{ validate: validateTextField }}
    rowProps={{
      label: licenseStringText,
      fullWidth: true,
      isInvalid,
      error: hasError,
    }}
    elementProps={{
      mode: 'text',
      width: '100%',
      height: '300px',
      theme: 'github',
      onChange: (e, license, field, form) => {
        form.setFieldValue('license', license);
      },
      onBlur: (e, field, form) => {
        form.setFieldTouched('license', true);
      },
    }}
  />
);

class UploadLicense extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      initialValues: {
        license: ''
      }
    };

    this.backendService = new SystemService(this.props.httpClient);
  }

  componentWillUnmount = () => {
    this.props.onTriggerCustomFlyout(null);
  }

  onSubmit = async ({ license }, { setSubmitting }) => {
    const { onTriggerSuccessCallout, onTriggerErrorCallout, history } = this.props;
    try {
      await this.backendService.uploadLicense(license);
      onTriggerSuccessCallout(licenseWasUploadedSuccessfullyText);
      history.push({
        pathname: APP_PATH.SYSTEM_INFO,
        state: {
          selectedSideNavItemName: SIDE_NAV.LICENSE
        }
      });
    } catch (error) {
      onTriggerErrorCallout(error);
    }
    setSubmitting(false);
  }

  importAndSubmitLicense = async ([licenseFile], isSubmitting, handleSubmit) => {
    if (!licenseFile) {
      this.setState({ initialValues: { license: '' } });
      return false;
    }
    this.setState({ isLoading: true });
    try {
      const license = await readFileAsText(licenseFile);
      this.setState({ initialValues: { license } });
      handleSubmit();
    } catch (error) {
      this.props.onTriggerErrorCallout(licenseFileCantBeImportedText);
    }
    this.setState({ isLoading: false });
  }

  render() {
    const { history } = this.props;
    const { initialValues } = this.state;

    return (
      <Formik
        initialValues={initialValues}
        onSubmit={this.onSubmit}
        validateOnChange={false}
        enableReinitialize={true}
        render={({ handleSubmit, isSubmitting, values }) => {
          return (
            <ContentPanel
              title={uploadLicenseText}
              actions={[
                (<CancelButton onClick={() => history.push(APP_PATH.SYSTEM_INFO)} />),
                (<SaveButton isDisabled={!values.license} isLoading={isSubmitting} onClick={handleSubmit} />)
              ]}
            >
              <EuiFlexGroup>
                <EuiFlexItem grow={4}>
                  <LicenseEditor />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiFormRow label={uploadLicenseFileText} helpText={uploadFileformatsText}>
                    <EuiFilePicker
                      data-test-subj="sgImportLicenseFlyoutFilePicker"
                      initialPromptText={selectOrDragAndDropLicenseFileText}
                      disabled={this.state.isLoading}
                      onChange={event => this.importAndSubmitLicense(event, isSubmitting, handleSubmit)}
                      accept=".txt,.lic"
                    />
                  </EuiFormRow>
                </EuiFlexItem>
              </EuiFlexGroup>
            </ContentPanel>
          );
        }}
      />
    );
  }
}

UploadLicense.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  httpClient: PropTypes.func.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired,
  onTriggerSuccessCallout: PropTypes.func.isRequired,
  onTriggerCustomFlyout: PropTypes.func.isRequired
};

export default UploadLicense;
