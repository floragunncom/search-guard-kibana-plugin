import React, { Component } from 'react';
import { Formik, Form } from 'formik';
import PropTypes from 'prop-types';
import { EuiButton, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { isEqual } from 'lodash';
import {
  i18nSaveText,
  i18nCancelText,
  i18nCreateInternalUserText
} from '../../../../utils/i18n_nodes';
import { ContentPanel, FormikEffect, PageModelEditor } from '../../../../components';
import { BackendRoles, UserAttributes, UserCredentials } from '../../components';
import { APP_PATH } from '../../../../utils/constants';
import { stringifyPretty } from '../../../../utils/helpers';
import { DEFAULT_USER } from './utils/constants';
import { userToFormik, formikToUser } from './utils';

class CreateInternalUser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: userToFormik(DEFAULT_USER),
      userText: stringifyPretty(DEFAULT_USER)
    };
  }

  onSubmit = (values, { setSubmitting }) => {
    values = formikToUser(values);
    console.log('CreateInternalUser - onSubmit - values', values);
    setSubmitting(false);
  };

  updatePageModelEditor = values => {
    this.setState({ userText: stringifyPretty(formikToUser(values)) });
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
    const { history } = this.props;
    const { data, userText } = this.state;

    return (
      <Formik
        initialValues={data}
        onSubmit={this.onSubmit}
        validateOnChange={false}
        enableReinitialize={true}
        render={({ values, handleSubmit, isSubmitting }) => {
          return (
            <Form>
              <FormikEffect onChange={(current, prev) => {
                if (!isEqual(current.values, prev.values)) {
                  this.updatePageModelEditor(current.values);
                }
              }}
              />
              <ContentPanel
                title={i18nCreateInternalUserText}
                actions={[
                  this.renderCancelButton(history),
                  this.renderSaveButton({ handleSubmit, isSubmitting })
                ]}
              >
                <EuiFlexGroup>
                  <EuiFlexItem>
                    <UserCredentials />
                    <BackendRoles roles={values.roles} />
                    <UserAttributes attributes={values.attributes} />
                  </EuiFlexItem>

                  <EuiFlexItem>
                    <PageModelEditor value={userText} showJson={values.showJson} />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </ContentPanel>
            </Form>
          );
        }}
      />
    );
  }
}

CreateInternalUser.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  httpClient: PropTypes.func.isRequired
};

export default CreateInternalUser;
