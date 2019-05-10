import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import { get } from 'lodash';
import { EuiButton, EuiFilePicker, EuiSpacer } from '@elastic/eui';
import { ContentPanel, FormikCodeEditor } from '../../../../components';
import { APP_PATH, CALLOUTS, FLYOUTS } from '../../../../utils/constants';
import { cancelText, saveText } from '../../../../utils/i18n/common';
import {
  importText,
  uploadLicenseText,
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
      onChange: (license, field, form) => {
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
      error: null,
      isLoading: false,
      licenseFile: undefined,
      initialValues: {
        license: ''
      }
    };

    this.backendService = new SystemService(this.props.httpClient);
  }

  onSubmit = async ({ license }, { setSubmitting }) => {
    const { onTriggerCallout } = this.props;
    try {
      await this.backendService.uploadLicense(license);
      this.setState({ error: null });
      onTriggerCallout({
        type: CALLOUTS.SUCCESS_CALLOUT,
        payload: licenseWasUploadedSuccessfullyText
      });
    } catch (error) {
      this.handleTriggerErrorCallout(error);
    }
    setSubmitting(false);
  }

  handleTriggerErrorCallout = error => {
    error = error.data || error;
    this.setState({ error });
    this.props.onTriggerCallout({
      type: CALLOUTS.ERROR_CALLOUT,
      payload: get(error, 'message') || error
    });
  }

  setImportedLicenseFile = ([licenseFile]) => this.setState({ licenseFile })

  importFile = async () => {
    this.setState({ isLoading: true });
    try {
      const license = await readFileAsText(this.state.licenseFile);
      this.setState({ initialValues: { license } });
    } catch (error) {
      this.handleTriggerErrorCallout(licenseFileCantBeImportedText);
    }
    this.setState({ isLoading: false });
  }

  renderCancelButton = history => (
    <EuiButton onClick={() => history.push(APP_PATH.SYSTEM_INFO)}>
      {cancelText}
    </EuiButton>
  )

  renderSaveButton = ({ isSubmitting, handleSubmit }) => (
    <EuiButton isLoading={isSubmitting} iconType="save" fill onClick={handleSubmit}>
      {saveText}
    </EuiButton>
  )

  renderImportButton = () => (
    <EuiButton
      iconType="importAction"
      isLoading={this.state.isLoading}
      onClick={() => {
        this.props.onTriggerFlyout({
          type: FLYOUTS.CUSTOM,
          payload: {
            title: uploadLicenseText,
            flyoutProps: { size: 's' },
            body: (
              <div>
                <EuiFilePicker
                  initialPromptText={selectOrDragAndDropLicenseFileText}
                  disabled={this.state.isLoading}
                  onChange={this.setImportedLicenseFile}
                  accept=".txt,.lic"
                />
                <EuiSpacer />
                <EuiButton size="s" onClick={this.importFile}>{importText}</EuiButton>
              </div>
            )
          }
        });
      }}
    >
      {importText}
    </EuiButton>
  )

  render() {
    const { history } = this.props;
    const { initialValues } = this.state;

    return (
      <Formik
        initialValues={initialValues}
        onSubmit={this.onSubmit}
        validateOnChange={false}
        enableReinitialize={true}
        render={({ handleSubmit, isSubmitting }) => {
          return (
            <ContentPanel
              title={uploadLicenseText}
              actions={[
                this.renderCancelButton(history),
                this.renderSaveButton({ handleSubmit, isSubmitting }),
                this.renderImportButton(history)
              ]}
            >
              <LicenseEditor />
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
  onTriggerCallout: PropTypes.func.isRequired
};

export default UploadLicense;
