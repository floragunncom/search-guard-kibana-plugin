import React, { Component, Fragment } from 'react';
import { Formik } from 'formik';
import PropTypes from 'prop-types';
import { EuiCallOut, EuiSpacer } from '@elastic/eui';
import queryString from 'query-string';
import { createInternalUserText, updateInternalUserText } from '../../utils/i18n/internal_users';
import { ContentPanel, InspectButton } from '../../components';
import { CancelButton, SaveButton } from '../../components/ContentPanel/components';
import { BackendRoles, UserAttributes, UserCredentials } from './components';
import { APP_PATH, INTERNAL_USERS_ACTIONS } from '../../utils/constants';
import { DEFAULT_USER } from './utils/constants';
import { userToFormik, formikToUser } from './utils';
import { internalUsersToUiBackendRoles } from '../../utils/helpers';

// TODO: make this component get API data by chunks (paginations)
class CreateInternalUser extends Component {
  constructor(props) {
    super(props);

    const { location } = this.props;
    const { id } = queryString.parse(location.search);
    this.state = {
      id,
      isEdit: !!id,
      resource: userToFormik(DEFAULT_USER, id),
      allBackendRoles: [],
      isLoading: true,
      errorMessage: null
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

  componentWillUnmount = () => {
    this.props.onTriggerInspectJsonFlyout(null);
  }

  fetchData = async () => {
    const { id } = this.state;
    const { internalUsersService, onTriggerErrorCallout } = this.props;
    try {
      this.setState({ isLoading: true });
      const { data: internalUsers } = await internalUsersService.list();
      this.setState({
        allBackendRoles: internalUsersToUiBackendRoles(internalUsers)
      });

      if (id) {
        const resource = await internalUsersService.get(id);
        this.setState({ resource: userToFormik(resource, id) });
      } else {
        this.setState({
          resource: userToFormik(DEFAULT_USER),
          isEdit: !!id
        });
      }
    } catch(error) {
      onTriggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  }

  onSubmit = async (values, { setSubmitting }) => {
    const { internalUsersService, history } = this.props;
    const { _username } = values;
    try {
      this.setState({ errorMessage: null });
      const user = formikToUser(values);
      const doPreSave = false;
      await internalUsersService.save(_username, user, doPreSave);
      setSubmitting(false);
      history.push(APP_PATH.INTERNAL_USERS);
    } catch (error) {
      setSubmitting(false);
      this.setState({ errorMessage: error.data.message });
    }
  }

  render() {
    const {
      history,
      onTriggerInspectJsonFlyout,
      location,
      onTriggerConfirmDeletionModal,
      onComboBoxChange,
      onComboBoxOnBlur,
      onComboBoxCreateOption
    } = this.props;
    const { resource, isEdit, allBackendRoles, isLoading, errorMessage } = this.state;
    const { action, id } = queryString.parse(location.search);
    const updateUser = action === INTERNAL_USERS_ACTIONS.UPDATE_USER;
    const titleText = updateUser ? updateInternalUserText : createInternalUserText;

    return (
      <Formik
        initialValues={resource}
        onSubmit={this.onSubmit}
        validateOnChange={false}
        enableReinitialize={true}
      >
        {({ values, handleSubmit, isSubmitting }) => {
          const isUpdatingName = id !== values._username;

          return (
            <ContentPanel
              title={titleText}
              isLoading={isLoading}
              actions={[
                (<CancelButton onClick={() => history.push(APP_PATH.INTERNAL_USERS)} />),
                (<SaveButton isLoading={isSubmitting} onClick={handleSubmit} />)
              ]}
            >
              <InspectButton
                onClick={() => {
                  onTriggerInspectJsonFlyout({
                    json: formikToUser(values),
                    title: titleText
                  });
                }}
              />
              <EuiSpacer />

              {errorMessage &&
                <Fragment>
                  <EuiCallOut
                    size="s"
                    color="danger"
                    title={errorMessage}
                    iconType="alert"
                  />
                  <EuiSpacer />
                </Fragment>
              }

              <UserCredentials
                isEdit={isEdit}
                isUpdatingName={isUpdatingName}
                values={values}
                {...this.props}
              />
              <BackendRoles
                allRoles={allBackendRoles}
                onComboBoxChange={onComboBoxChange}
                onComboBoxOnBlur={onComboBoxOnBlur}
                onComboBoxCreateOption={onComboBoxCreateOption}
              />
              <UserAttributes
                attributes={values._attributes}
                onTriggerConfirmDeletionModal={onTriggerConfirmDeletionModal}
              />
            </ContentPanel>
          );
        }}
      </Formik>
    );
  }
}

CreateInternalUser.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  httpClient: PropTypes.func,
  internalUsersService: PropTypes.object.isRequired,
  onTriggerInspectJsonFlyout: PropTypes.func.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired
};

export default CreateInternalUser;
