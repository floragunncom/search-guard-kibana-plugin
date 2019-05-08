import React, { Component } from 'react';
import { Formik } from 'formik';
import PropTypes from 'prop-types';
import { EuiButton, EuiSpacer } from '@elastic/eui';
import queryString from 'query-string';
import { get } from 'lodash';
import { saveText, cancelText, inspectText } from '../../../../utils/i18n/common';
import { createInternalUserText } from '../../../../utils/i18n/internalusers';
import { ContentPanel } from '../../../../components';
import { BackendRoles, UserAttributes, UserCredentials } from '../../components';
import { APP_PATH, FLYOUTS, CALLOUTS } from '../../../../utils/constants';
import { DEFAULT_USER } from './utils/constants';
import { userToFormik, formikToUser } from './utils';

// TODO: make this component get API data by chunks (paginations)
class CreateInternalUser extends Component {
  constructor(props) {
    super(props);

    const { location } = this.props;
    const { id } = queryString.parse(location.search);
    this.state = {
      id,
      isEdit: !!id,
      resource: userToFormik({ user: DEFAULT_USER, id }),
      backendRoles: [],
      resources: [],
      error: null,
      isLoading: true
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillReceiveProps({ location }) {
    const { id } = queryString.parse(location.search);
    const { id: currentId } = this.state;
    if (id !== currentId) {
      this.setState({ id }, () => {
        this.fetchData();
      });
    }
  }

  fetchData = async () => {
    const { id } = this.state;
    const { internalUsersService, rolesService } = this.props;
    try {
      this.setState({ isLoading: true });
      const { data: resources } = await internalUsersService.list();
      const { data: backendRoles } = await rolesService.list();
      this.setState({
        resources: Object.keys(resources),
        backendRoles: Object.keys(backendRoles).map(label => ({ label })),
        error: null
      });

      if (id) {
        let resource = await internalUsersService.get(id);
        resource = userToFormik({ user: resource, id });
        this.setState({ resource });
      } else {
        this.setState({ resource: userToFormik({ user: DEFAULT_USER, id }), isEdit: !!id });
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
      const doPreSaveResourceAdaptation = false;
      await internalUsersService.save(username, user, doPreSaveResourceAdaptation);
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
      payload: get(error, 'message')
    });
  }

  renderCancelButton = history => (
    <EuiButton onClick={() => history.push(APP_PATH.INTERNAL_USERS)}>
      {cancelText}
    </EuiButton>
  )

  renderSaveButton = ({ isSubmitting, handleSubmit }) => (
    <EuiButton isLoading={isSubmitting} iconType="save" fill onClick={handleSubmit}>
      {saveText}
    </EuiButton>
  )

  render() {
    const { history, onTriggerFlyout } = this.props;
    const { resource, isEdit, backendRoles, resources, isLoading } = this.state;

    return (
      <Formik
        initialValues={resource}
        onSubmit={this.onSubmit}
        validateOnChange={false}
        enableReinitialize={true}
        render={({ values, handleSubmit, isSubmitting }) => {
          return (
            <ContentPanel
              title={createInternalUserText}
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
                      title: createInternalUserText
                    }
                  });
                }}
              >
                {inspectText}
              </EuiButton>
              <EuiSpacer />

              <UserCredentials isEdit={isEdit} values={values} allUsers={resources} />
              <BackendRoles allRoles={backendRoles} />
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
