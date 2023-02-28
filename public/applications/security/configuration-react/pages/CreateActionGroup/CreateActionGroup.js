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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import { EuiSpacer } from '@elastic/eui';
import queryString from 'query-string';
import { nameText, advancedText, typeText } from '../../utils/i18n/common';
import {
  createActionGroupText,
  updateActionGroupText,
  actionGroupsText,
  singlePermissionsText,
} from '../../utils/i18n/action_groups';
import {
  ContentPanel,
  FormikFieldText,
  FormikComboBox,
  FormikSwitch,
  FormikSelect,
  InspectButton,
  CancelButton,
  SaveButton,
} from '../../components';
import { APP_PATH, ACTION_GROUPS_ACTIONS } from '../../utils/constants';
import {
  isInvalid,
  hasError,
  validateName,
  validSinglePermissionOption,
} from '../../utils/validation';
import { DEFAULT_ACTION_GROUP, TYPES } from './utils/constants';
import { actionGroupToFormik, formikToActionGroup, actionGroupsToUiActionGroups } from './utils';
import { getAllUiIndexPermissions, getAllUiClusterPermissions } from '../../utils/helpers';
import { ActionGroupsService } from '../../services';

import { Context } from '../../Context';

class CreateActionGroup extends Component {
  static contextType = Context;

  constructor(props, context) {
    super(props, context);

    const { location } = this.props;
    const { httpClient } = context;

    this.backendService = new ActionGroupsService(httpClient);
    const { id } = queryString.parse(location.search);

    this.state = {
      id,
      isEdit: !!id,
      resource: actionGroupToFormik(DEFAULT_ACTION_GROUP, id),
      allActionGroups: [],
      allSinglePermissions: [...getAllUiIndexPermissions(), ...getAllUiClusterPermissions()],
      isLoading: true,
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
      const { data } = await this.backendService.list();
      const allActionGroups = actionGroupsToUiActionGroups(data, [id]);
      this.setState({ allActionGroups });

      if (id) {
        const resource = await this.backendService.get(id);
        this.setState({ resource: actionGroupToFormik(resource, id) });
      } else {
        this.setState({ resource: actionGroupToFormik(DEFAULT_ACTION_GROUP), isEdit: !!id });
      }
    } catch (error) {
      triggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  };

  onSubmit = async (values, { setSubmitting }) => {
    const { history } = this.props;
    const { triggerErrorCallout } = this.context;
    const { _name } = values;
    try {
      await this.backendService.save(_name, formikToActionGroup(values));
      setSubmitting(false);
      history.push(APP_PATH.ACTION_GROUPS);
    } catch (error) {
      setSubmitting(false);
      triggerErrorCallout(error);
    }
  };

  render() {
    const { history, location } = this.props;

    const {
      triggerInspectJsonFlyout,
      onComboBoxChange,
      onComboBoxCreateOption,
      onComboBoxOnBlur,
      onSwitchChange,
    } = this.context;

    const { resource, isLoading, allSinglePermissions, allActionGroups } = this.state;
    const { action, id } = queryString.parse(location.search);
    const updateActionGroup = action === ACTION_GROUPS_ACTIONS.UPDATE_ACTION_GROUP;
    const titleText = updateActionGroup ? updateActionGroupText : createActionGroupText;

    return (
      <Formik
        initialValues={resource}
        onSubmit={this.onSubmit}
        validateOnChange={false}
        enableReinitialize={true}
      >
        {({ values, handleSubmit, isSubmitting }) => {
          const isUpdatingName = id !== values._name;

          return (
            <ContentPanel
              title={titleText}
              isLoading={isLoading}
              actions={[
                <CancelButton onClick={() => history.push(APP_PATH.ACTION_GROUPS)} />,
                <SaveButton isLoading={isSubmitting} onClick={handleSubmit} />,
              ]}
            >
              <InspectButton
                onClick={() => {
                  triggerInspectJsonFlyout({
                    json: formikToActionGroup(values),
                    title: titleText,
                  });
                }}
              />
              <EuiSpacer />

              <FormikFieldText
                formRow
                formikFieldProps={{
                  validate: validateName(this.backendService, isUpdatingName),
                }}
                rowProps={{
                  label: nameText,
                  isInvalid,
                  error: hasError,
                }}
                elementProps={{
                  isInvalid,
                }}
                name="_name"
              />
              <FormikSelect
                formRow
                rowProps={{
                  label: typeText,
                }}
                elementProps={{
                  options: TYPES,
                }}
                name="type"
              />
              <FormikComboBox
                name="_actiongroups"
                formRow
                rowProps={{
                  label: actionGroupsText,
                }}
                elementProps={{
                  options: allActionGroups,
                  isClearable: true,
                  onBlur: onComboBoxOnBlur,
                  onChange: onComboBoxChange(),
                  onCreateOption: onComboBoxCreateOption(),
                }}
              />
              <FormikSwitch
                formRow
                elementProps={{
                  label: advancedText,
                  onChange: onSwitchChange,
                }}
                name="_isAdvanced"
              />
              {values._isAdvanced && (
                <FormikComboBox
                  name="_permissions"
                  formRow
                  rowProps={{
                    label: singlePermissionsText,
                    isInvalid,
                    error: hasError,
                  }}
                  elementProps={{
                    isInvalid,
                    options: allSinglePermissions,
                    isClearable: true,
                    onBlur: onComboBoxOnBlur,
                    onCreateOption: onComboBoxCreateOption(),
                    onChange: onComboBoxChange(),
                  }}
                  formikFieldProps={{
                    validate: validSinglePermissionOption,
                  }}
                />
              )}
            </ContentPanel>
          );
        }}
      </Formik>
    );
  }
}

CreateActionGroup.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default CreateActionGroup;
