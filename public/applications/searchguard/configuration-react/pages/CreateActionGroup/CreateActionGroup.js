/* eslint-disable @kbn/eslint/require-license-header */
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

  constructor(props) {
    super(props);

    const { location, httpClient } = this.props;

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
    this.context.triggerInspectJsonFlyout(null);
  };

  fetchData = async () => {
    const { id } = this.state;
    const { onTriggerErrorCallout } = this.props;
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
      onTriggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  };

  onSubmit = async (values, { setSubmitting }) => {
    const { history, onTriggerErrorCallout } = this.props;
    const { _name } = values;
    try {
      await this.backendService.save(_name, formikToActionGroup(values));
      setSubmitting(false);
      history.push(APP_PATH.ACTION_GROUPS);
    } catch (error) {
      setSubmitting(false);
      onTriggerErrorCallout(error);
    }
  };

  render() {
    const { history, location } = this.props;

    const {
      triggerInspectJsonFlyout,
      onComboBoxChange,
      onComboBoxCreateOption,
      onComboBoxOnBlur,
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
        render={({ values, handleSubmit, isSubmitting }) => {
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
                }}
              />
              <FormikSwitch
                formRow
                elementProps={{
                  label: advancedText,
                  checked: values._isAdvanced,
                }}
                name="_isAdvanced"
              />
              {values._isAdvanced && (
                <FormikComboBox
                  name="_permissions"
                  formRow
                  rowProps={{
                    label: singlePermissionsText,
                  }}
                  elementProps={{
                    options: allSinglePermissions,
                    isClearable: true,
                    onBlur: onComboBoxOnBlur,
                    onCreateOption: onComboBoxCreateOption(validSinglePermissionOption),
                    onChange: onComboBoxChange(),
                  }}
                />
              )}
            </ContentPanel>
          );
        }}
      />
    );
  }
}

CreateActionGroup.propTypes = {
  httpClient: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired,
};

export default CreateActionGroup;
