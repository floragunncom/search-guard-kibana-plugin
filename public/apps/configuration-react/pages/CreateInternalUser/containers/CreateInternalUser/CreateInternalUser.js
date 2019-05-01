import React, { Component } from 'react';
import { Formik, Form } from 'formik';
import PropTypes from 'prop-types';
import { EuiButton, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { isEqual } from 'lodash';
import queryString from 'query-string';
import {
  i18nSaveText,
  i18nCancelText,
  i18nCreateInternalUserText,
  i18nPasswordsDontMatchText
} from '../../../../utils/i18n_nodes';
import { ContentPanel, FormikEffect, PageModelEditor, ErrorCallOut } from '../../../../components';
import { BackendRoles, UserAttributes, UserCredentials } from '../../components';
import { APP_PATH } from '../../../../utils/constants';
import { stringifyPretty } from '../../../../utils/helpers';
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
      userText: stringifyPretty(DEFAULT_USER),
      allRoles: [], // TODO: fetch roles from API
      passwordsMatch: true
    };
  }

  onSubmit = (values, { setSubmitting }) => {
    const passwordsMatch = values.password === values.passwordRepeat;
    this.setState({ passwordsMatch });
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
    const { initialValues, userText, isEdit, passwordsMatch, allRoles } = this.state;

    return (
      <Formik
        initialValues={initialValues}
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
                {!passwordsMatch && <ErrorCallOut text={i18nPasswordsDontMatchText} />}

                <EuiFlexGroup>
                  <EuiFlexItem>
                    <UserCredentials isEdit={isEdit} values={values} />
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <PageModelEditor value={userText} showJson={values.showJson} />
                  </EuiFlexItem>
                </EuiFlexGroup>

                <EuiFlexGroup>
                  <EuiFlexItem>
                    <BackendRoles allRoles={allRoles} />
                  </EuiFlexItem>
                </EuiFlexGroup>

                <UserAttributes attributes={values.attributes} />
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
