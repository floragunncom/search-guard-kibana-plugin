import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import { EuiSpacer, EuiLink, EuiText, EuiTextColor } from '@elastic/eui';
import queryString from 'query-string';
import {
  createRoleMappingText,
  updateRoleMappingText,
  roleHelpText
} from '../../utils/i18n/role_mappings';
import {
  roleText,
  backendRolesText,
  usersText,
  hostsText,
  createRoleText
} from '../../utils/i18n/roles';
import {
  ContentPanel,
  FormikComboBox,
  InspectButton,
  CancelButton,
  SaveButton
} from '../../components';
import { APP_PATH, ROLE_MAPPINGS_ACTIONS } from '../../utils/constants';
import { DEFAULT_ROLE_MAPPING } from './utils/constants';
import {
  roleMappingToFormik,
  formikToRoleMapping,
  internalUsersToUiInternalUsers,
  rolesToUiRoles
} from './utils';
import { internalUsersToUiBackendRoles } from '../../utils/helpers';
import { hasError, isInvalid, validateEmptyComboBox } from '../../utils/validation';

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
      allRoles: [],
      allBackendRoles: []
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillUnmount = () => {
    this.props.onTriggerInspectJsonFlyout(null);
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
      const { data: allRoles } = await rolesService.list();
      const { data: allRoleMappings } = await roleMappingsService.list();
      this.setState({
        allBackendRoles: internalUsersToUiBackendRoles(allInternalUsers),
        allInternalUsers: internalUsersToUiInternalUsers(allInternalUsers),
        allRoles: rolesToUiRoles(allRoles, allRoleMappings)
      });

      if (id) {
        const resource = await roleMappingsService.get(id);
        this.setState({ resource: roleMappingToFormik(resource, id) });
      } else {
        this.setState({
          resource: roleMappingToFormik(DEFAULT_ROLE_MAPPING),
          isEdit: !!id
        });
      }
    } catch(error) {
      onTriggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  }

  onSubmit = async (values, { setSubmitting }) => {
    const { history, onTriggerErrorCallout, roleMappingsService } = this.props;
    const { _name: [{ label: name }] } = values;
    try {
      const doPreSave = false;
      await roleMappingsService.save(name, formikToRoleMapping(values), doPreSave);
      setSubmitting(false);
      history.push(APP_PATH.ROLE_MAPPINGS);
    } catch (error) {
      setSubmitting(false);
      onTriggerErrorCallout(error);
    }
  }

  renderRoleHelpText = history => (
    <Fragment>
      {roleHelpText}{' '}
      <EuiLink
        data-test-subj="sgCreateRole"
        onClick={() => history.push(APP_PATH.CREATE_ROLE)}
      >
        {createRoleText}
      </EuiLink>
    </Fragment>
  )

  renderRoleOption = ({ color, label }) => {
    return (
      <EuiText size="s">
        <EuiTextColor color={color}>{label}</EuiTextColor>
      </EuiText>
    );
  };

  render() {
    const {
      history,
      onTriggerInspectJsonFlyout,
      location,
      onComboBoxOnBlur,
      onComboBoxChange,
      onComboBoxCreateOption
    } = this.props;
    const {
      resource,
      isLoading,
      allInternalUsers,
      allRoles,
      allBackendRoles
    } = this.state;
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
                (<CancelButton onClick={() => history.push(APP_PATH.ROLE_MAPPINGS)} />),
                (<SaveButton isLoading={isSubmitting} onClick={handleSubmit} />)
              ]}
            >
              <InspectButton
                onClick={() => {
                  onTriggerInspectJsonFlyout({
                    json: formikToRoleMapping(values),
                    title: titleText
                  });
                }}
              />
              <EuiSpacer />

              <FormikComboBox
                name="_name"
                formRow
                formikFieldProps={{ validate: validateEmptyComboBox }}
                rowProps={{
                  label: roleText,
                  helpText: this.renderRoleHelpText(history),
                  error: hasError,
                  isInvalid
                }}
                elementProps={{
                  options: allRoles,
                  isClearable: false,
                  singleSelection: { asPlainText: true },
                  onChange: onComboBoxChange(validateEmptyComboBox),
                  renderOption: this.renderRoleOption
                }}
              />
              <FormikComboBox
                name="_users"
                formRow
                rowProps={{
                  label: usersText
                }}
                elementProps={{
                  options: allInternalUsers,
                  isClearable: true,
                  onChange: onComboBoxChange(),
                  onCreateOption: onComboBoxCreateOption(),
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
                  options: allBackendRoles,
                  isClearable: true,
                  onChange: onComboBoxChange(),
                  onCreateOption: onComboBoxCreateOption(),
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
                  onChange: onComboBoxChange(),
                  onCreateOption: onComboBoxCreateOption(),
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
