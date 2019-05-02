import React, { Component, Fragment } from 'react';
import { Formik } from 'formik';
import PropTypes from 'prop-types';
import { EuiButton, EuiSpacer } from '@elastic/eui';
import queryString from 'query-string';
import {
  i18nSaveText,
  i18nCancelText,
  i18nCreateInternalUserText,
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

    const { location } = this.props;
    const { id } = queryString.parse(location.search);
    this.state = {
      id,
      isEdit: !!id,
      user: userToFormik({ user: DEFAULT_USER, id }),
      allRoles: [],
      allUsers: [],
      error: null,
      isLoading: true
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate() {
    const { id } = queryString.parse(this.props.location.search);
    const { id: currentId } = this.state;
    if (id !== currentId) {
      this.setState({ id });
      this.fetchData();
    }
  }

  fetchData = async () => {
    const { id } = this.state;
    const { internalUsersService, rolesService } = this.props;
    try {
      this.setState({ isLoading: true });
      const { data: allUsers } = await internalUsersService.list();
      const { data: allRoles } = await rolesService.list();
      this.setState({
        allUsers: Object.keys(allUsers),
        allRoles: Object.keys(allRoles).map(label => ({ label })),
        error: null
      });

      if (id) {
        let user = await internalUsersService.get(id);
        user = userToFormik({ user, id });
        this.setState({ user });
      }
    } catch(error) {
      this.handleTriggerCallout(error);
    }
    this.setState({ isLoading: false });
  }

  onSubmit = async (values, { setSubmitting }) => {
    const { internalUsersService, history } = this.props;
    const { username } = values;
    try {
      const user = formikToUser(values);
      const doPreSaveUserAdaptation = false;
      await internalUsersService.save(username, user, doPreSaveUserAdaptation);
      this.setState({ error: null });
    } catch (error) {
      this.handleTriggerCallout(error);
    }
    setSubmitting(false);
    if (!this.state.error) {
      history.push(APP_PATH.INTERNAL_USERS);
    }
  }

  handleTriggerCallout = error => {
    error = error.data || error;
    this.setState({ error });
    this.props.onTriggerCallout({
      type: CALLOUTS.ERROR_CALLOUT,
      payload: (
        <Fragment>
          <p>{error.message}</p>
          {error.stack && <p>{error.stack}</p>}
        </Fragment>
      )
    });
  }

  renderCancelButton = history => (
    <EuiButton onClick={() => history.push(APP_PATH.INTERNAL_USERS)}>
      {i18nCancelText}
    </EuiButton>
  )

  renderSaveButton = ({ isSubmitting, handleSubmit }) => (
    <EuiButton isLoading={isSubmitting} iconType="save" fill onClick={handleSubmit}>
      {i18nSaveText}
    </EuiButton>
  )

  render() {
    const { history, onTriggerFlyout } = this.props;
    const { user, isEdit, allRoles, allUsers, isLoading } = this.state;

    return (
      <Formik
        initialValues={user}
        onSubmit={this.onSubmit}
        validateOnChange={false}
        enableReinitialize={true}
        render={({ values, handleSubmit, isSubmitting }) => {
          return (
            <ContentPanel
              title={i18nCreateInternalUserText}
              isLoading={isLoading}
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

              <UserCredentials isEdit={isEdit} values={values} allUsers={allUsers} />
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
  httpClient: PropTypes.func,
  internalUsersService: PropTypes.object.isRequired,
  rolesService: PropTypes.object.isRequired,
  onTriggerFlyout: PropTypes.func.isRequired,
  onTriggerCallout: PropTypes.func.isRequired
};

export default CreateInternalUser;
