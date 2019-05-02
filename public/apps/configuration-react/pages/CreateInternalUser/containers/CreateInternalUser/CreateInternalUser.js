import React, { Component } from 'react';
import { Formik } from 'formik';
import PropTypes from 'prop-types';
import { EuiButton, EuiSpacer } from '@elastic/eui';
import queryString from 'query-string';
import {
  i18nSaveText,
  i18nCancelText,
  i18nCreateInternalUserText,
  i18nPasswordsDontMatchText,
  i18nInspectText
} from '../../../../utils/i18n_nodes';
import { ContentPanel } from '../../../../components';
import { BackendRoles, UserAttributes, UserCredentials } from '../../components';
import { APP_PATH, FLYOUTS, CALLOUTS } from '../../../../utils/constants';
import { DEFAULT_USER } from './utils/constants';
import { userToFormik, formikToUser } from './utils';

class CreateInternalUser extends Component {
  constructor(props) {
    super(props);

    const { id } = queryString.parse(this.props.location.search);
    this.state = {
      id,
      isEdit: !!id,
      initialValues: userToFormik(DEFAULT_USER),
      allRoles: [] // TODO: fetch roles from API
    };
  }

  onSubmit = (values, { setSubmitting }) => {
    const { onTriggerCallout } = this.props;
    const passwordsMatch = values.password === values.passwordRepeat;
    if (!passwordsMatch) {
      onTriggerCallout({
        type: CALLOUTS.ERROR_CALLOUT,
        payload: i18nPasswordsDontMatchText
      });
    }
    values = formikToUser(values);
    console.log('CreateInternalUser - onSubmit - values', values);
    setSubmitting(false);
  };

  renderCancelButton = history => (
    <EuiButton
      onClick={() => history.push(APP_PATH.INTERNAL_USERS)}
    >
      {i18nCancelText}
    </EuiButton>
  );

  renderSaveButton = ({ isSubmitting, handleSubmit }) => (
    <EuiButton isLoading={isSubmitting} iconType="save" fill onClick={handleSubmit}>
      {i18nSaveText}
    </EuiButton>
  );

  render() {
    const { history, onTriggerFlyout } = this.props;
    const { initialValues, isEdit, allRoles } = this.state;

    return (
      <Formik
        initialValues={initialValues}
        onSubmit={this.onSubmit}
        validateOnChange={false}
        enableReinitialize={true}
        render={({ values, handleSubmit, isSubmitting }) => {
          return (
            <ContentPanel
              title={i18nCreateInternalUserText}
              actions={[
                this.renderCancelButton(history),
                this.renderSaveButton({ handleSubmit, isSubmitting })
              ]}
            >
              <EuiButton
                size="s"
                iconType="inspect"
                onClick={() => {
                  onTriggerFlyout({
                    type: FLYOUTS.INSPECT_JSON,
                    payload: {
                      json: formikToUser(values),
                      title: i18nCreateInternalUserText
                    }
                  });
                }}
              >
                {i18nInspectText}
              </EuiButton>
              <EuiSpacer />

              <UserCredentials isEdit={isEdit} values={values} />
              <BackendRoles allRoles={allRoles} />
              <UserAttributes attributes={values.attributes} />
            </ContentPanel>
          );
        }}
      />
    );
  }
}

CreateInternalUser.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  httpClient: PropTypes.func.isRequired,
  onTriggerFlyout: PropTypes.func.isRequired,
  onTriggerCallout: PropTypes.func.isRequired
};

export default CreateInternalUser;
