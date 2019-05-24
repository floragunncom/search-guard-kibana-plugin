import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import { EuiButton, EuiSpacer } from '@elastic/eui';
import queryString from 'query-string';
import {
  saveText,
  cancelText,
  inspectText
} from '../../utils/i18n/common';
import {
  createRoleMappingText,
  updateRoleMappingText
} from '../../utils/i18n/role_mappings';
import {
  roleText,
  backendRolesText,
  usersText,
  hostsText
} from '../../utils/i18n/roles';
import { ContentPanel, FormikComboBox } from '../../components';
import { APP_PATH, ROLE_MAPPINGS_ACTIONS } from '../../utils/constants';
import { DEFAULT_ROLE_MAPPING } from './utils/constants';
import {
  roleMappingToFormik,
  formikToRoleMapping,
  internalUsersToUiInternalUsers,
  rolesToUiRoles
} from './utils';

class CreateRoleMapping extends Component {
  constructor(props) {
    super(props);

    const { location } = this.props;
    const { id } = queryString.parse(location.search);
    this.state = {
      id,
      isEdit: !!id,
      resource: roleMappingToFormik(DEFAULT_ROLE_MAPPING, id),
      isLoading: true,
      allInternalUsers: [],
      allNotReservedRoles: []
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
    const {
      onTriggerErrorCallout,
      roleMappingsService,
      internalUsersService,
      rolesService
    } = this.props;
    try {
      this.setState({ isLoading: true });
      const { data: allInternalUsers } = await internalUsersService.list();
      const { data: allNotReservedRoles } = await rolesService.list();
      this.setState({
        allInternalUsers: internalUsersToUiInternalUsers(allInternalUsers),
        allNotReservedRoles: rolesToUiRoles(allNotReservedRoles)
      });

      if (id) {
        const resource = await roleMappingsService.get(id);
        this.setState({ resource: roleMappingToFormik(resource, id) });
      } else {
        this.setState({ resource: roleMappingToFormik(DEFAULT_ROLE_MAPPING), isEdit: !!id });
      }
    } catch(error) {
      onTriggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  }

  onSubmit = async (values, { setSubmitting }) => {
    const { history, onTriggerErrorCallout, roleMappingsService } = this.props;
    const { _name: { label: name } } = values;
    try {
      await roleMappingsService.save(name, formikToRoleMapping(values));
      setSubmitting(false);
      history.push(APP_PATH.ROLE_MAPPINGS);
    } catch (error) {
      setSubmitting(false);
      onTriggerErrorCallout(error);
    }
  }

  renderCancelButton = history => (
    <EuiButton onClick={() => history.push(APP_PATH.ROLE_MAPPINGS)}>
      {cancelText}
    </EuiButton>
  )

  renderSaveButton = ({ isSubmitting, handleSubmit }) => (
    <EuiButton isLoading={isSubmitting} iconType="save" fill onClick={handleSubmit}>
      {saveText}
    </EuiButton>
  )

  render() {
    const {
      history,
      onTriggerInspectJsonFlyout,
      location,
      onComboBoxOnBlur,
      onComboBoxChange,
      onComboBoxCreateOption
    } = this.props;
    const { resource, isLoading, allInternalUsers, allNotReservedRoles } = this.state;
    const { action } = queryString.parse(location.search);
    const updateRoleMapping = action === ROLE_MAPPINGS_ACTIONS.UPDATE_ROLE_MAPPING;
    const titleText = updateRoleMapping ? updateRoleMappingText : createRoleMappingText;

    return (
      <Formik
        initialValues={resource}
        onSubmit={this.onSubmit}
        validateOnChange={false}
        enableReinitialize={true}
        render={({ values, handleSubmit, isSubmitting }) => {
          return (
            <ContentPanel
              title={titleText}
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
                  onTriggerInspectJsonFlyout({
                    json: formikToRoleMapping(values),
                    title: titleText
                  });
                }}
              >
                {inspectText}
              </EuiButton>
              <EuiSpacer />

              <FormikComboBox
                name="_name"
                formRow
                rowProps={{
                  label: roleText,
                }}
                elementProps={{
                  options: allNotReservedRoles,
                  isClearable: false,
                  singleSelection: { asPlainText: true },
                  onChange: (options, field, form) => {
                    form.setFieldValue(field.name, options);
                  }
                }}
              />
              <FormikComboBox
                name="_users"
                formRow
                rowProps={{
                  label: usersText,
                }}
                elementProps={{
                  options: allInternalUsers,
                  isClearable: true,
                  onChange: onComboBoxChange,
                  onCreateOption: onComboBoxCreateOption,
                  onBlur: onComboBoxOnBlur
                }}
              />
              <FormikComboBox
                name="_backendRoles"
                formRow
                rowProps={{
                  label: backendRolesText,
                }}
                elementProps={{
                  isClearable: true,
                  onChange: onComboBoxChange,
                  onCreateOption: onComboBoxCreateOption,
                  onBlur: onComboBoxOnBlur
                }}
              />
              <FormikComboBox
                name="_hosts"
                formRow
                rowProps={{
                  label: hostsText,
                }}
                elementProps={{
                  isClearable: true,
                  onChange: onComboBoxChange,
                  onCreateOption: onComboBoxCreateOption,
                  onBlur: onComboBoxOnBlur
                }}
              />
            </ContentPanel>
          );
        }}
      />
    );
  }
}

CreateRoleMapping.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  roleMappingsService: PropTypes.object.isRequired,
  internalUsersService: PropTypes.object.isRequired,
  rolesService: PropTypes.object.isRequired,
  onTriggerInspectJsonFlyout: PropTypes.func.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired
};

export default CreateRoleMapping;
