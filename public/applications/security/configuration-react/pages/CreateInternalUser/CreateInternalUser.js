/*
 * Copyright 2023 Excelerate Technology Limited T/A Eliatra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * *    Copyright 2020 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component, Fragment } from 'react';
import { Formik } from 'formik';
import PropTypes from 'prop-types';
import { EuiCallOut, EuiSpacer } from '@elastic/eui';
import queryString from 'query-string';
import { createInternalUserText, updateInternalUserText } from '../../utils/i18n/internal_users';
import {
  ContentPanel,
  InspectButton,
  CancelButton,
  SaveButton,
  FormikSwitch,
} from '../../components';
import { BackendRoles, SecurityRoles, UserAttributes, UserCredentials } from './components';
import { APP_PATH, INTERNAL_USERS_ACTIONS } from '../../utils/constants';
import { DEFAULT_USER } from './utils/constants';
import { userToFormik, formikToUser } from './utils';
import { arrayToComboBoxOptions, internalUsersToUiBackendRoles } from '../../utils/helpers';
import { InternalUsersService, RolesService } from '../../services';
import { advancedText } from '../../../../utils/i18n/common';
import { Context } from '../../Context';

class CreateInternalUser extends Component {
  static contextType = Context;

  constructor(props, context) {
    super(props, context);

    const { location } = this.props;
    this.backendService = new InternalUsersService(context.httpClient);
    this.rolesService = new RolesService(context.httpClient);
    const { id } = queryString.parse(location.search);

    this.state = {
      id,
      isEdit: !!id,
      resource: userToFormik(DEFAULT_USER, id),
      allSecurityRoles: [],
      allBackendRoles: [],
      isLoading: true,
      errorMessage: null,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillUnmount = () => {
    this.context.closeFlyout();
  };

  fetchData = async () => {
    const { id } = this.state;
    const { triggerErrorCallout } = this.context;
    try {
      this.setState({ isLoading: true });

      if (id) {
        const resource = await this.backendService.get(id);
        this.setState({ resource: userToFormik(resource, { id }) });
      } else {
        this.setState({
          resource: userToFormik(DEFAULT_USER),
          isEdit: !!id,
        });
      }

      const [{ data: internalUsers }, { data: securityRoles }] = await Promise.all([
        this.backendService.list(),
        this.rolesService.list(),
      ]);

      this.setState({
        allBackendRoles: internalUsersToUiBackendRoles(internalUsers),
        allSecurityRoles: arrayToComboBoxOptions(Object.keys(securityRoles).sort()),
      });
    } catch (error) {
      triggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  };

  onSubmit = async (values, { setSubmitting }) => {
    const { history } = this.props;
    const { _username } = values;
    try {
      this.setState({ errorMessage: null });
      const user = formikToUser(values);
      await this.backendService.save(_username, user);
      setSubmitting(false);
      history.push(APP_PATH.INTERNAL_USERS);
    } catch (error) {
      setSubmitting(false);
      this.setState({ errorMessage: error.body.message });
    }
  };

  render() {
    const { history, location } = this.props;
    const {
      triggerInspectJsonFlyout,
      onComboBoxChange,
      onComboBoxOnBlur,
      onComboBoxCreateOption,
      onSwitchChange,
    } = this.context;
    const {
      resource,
      isEdit,
      allSecurityRoles,
      allBackendRoles,
      isLoading,
      errorMessage,
    } = this.state;
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
                <CancelButton onClick={() => history.push(APP_PATH.INTERNAL_USERS)} />,
                <SaveButton isLoading={isSubmitting} onClick={handleSubmit} />,
              ]}
            >
              <InspectButton
                onClick={() => {
                  triggerInspectJsonFlyout({
                    json: formikToUser(values),
                    title: titleText,
                  });
                }}
              />
              <EuiSpacer />

              {errorMessage && (
                <Fragment>
                  <EuiCallOut size="s" color="danger" title={errorMessage} iconType="alert" />
                  <EuiSpacer />
                </Fragment>
              )}

              <UserCredentials isEdit={isEdit} isUpdatingName={isUpdatingName} values={values} />

              <SecurityRoles allSecurityRoles={allSecurityRoles} />

              <FormikSwitch
                formRow
                elementProps={{
                  label: advancedText,
                  onChange: onSwitchChange,
                }}
                name="_isAdvanced"
              />
              {values._isAdvanced && (
                <BackendRoles
                  allRoles={allBackendRoles}
                  onComboBoxChange={onComboBoxChange}
                  onComboBoxOnBlur={onComboBoxOnBlur}
                  onComboBoxCreateOption={onComboBoxCreateOption}
                />
              )}

              <EuiSpacer />
              <UserAttributes values={values} />
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
};

export default CreateInternalUser;
