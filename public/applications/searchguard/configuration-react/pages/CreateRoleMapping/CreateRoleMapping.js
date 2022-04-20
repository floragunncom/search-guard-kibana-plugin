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
  ipsText,
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
import { RolesService, RolesMappingService, InternalUsersService } from '../../services';
import { Context } from '../../Context';

class CreateRoleMapping extends Component {
  static contextType = Context;

  constructor(props, context) {
    super(props, context);

    const { location } = this.props;
    const { httpClient } = context;
    this.rolesService = new RolesService(httpClient);
    this.rolesMappingService = new RolesMappingService(httpClient);
    this.internalUsersService = new InternalUsersService(httpClient);
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
    this.context.closeFlyout();
  }

  fetchData = async () => {
    const { id } = this.state;
    const { triggerErrorCallout } = this.context;

    try {
      this.setState({ isLoading: true });

      const [
        { data: allInternalUsers },
        { data: allRoles },
        { data: allRoleMappings },
      ] = await Promise.all([
        this.internalUsersService.list(),
        this.rolesService.list(),
        this.rolesMappingService.list(),
      ]);

      this.setState({
        allBackendRoles: internalUsersToUiBackendRoles(allInternalUsers),
        allInternalUsers: internalUsersToUiInternalUsers(allInternalUsers),
        allRoles: rolesToUiRoles(allRoles, allRoleMappings)
      });

      if (id) {
        const resource = await this.rolesMappingService.get(id);
        this.setState({ resource: roleMappingToFormik(resource, id) });
      } else {
        this.setState({
          resource: roleMappingToFormik(DEFAULT_ROLE_MAPPING),
          isEdit: !!id
        });
      }
    } catch (error) {
      triggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  }

  onSubmit = async (values, { setSubmitting }) => {
    const { history } = this.props;
    const { triggerErrorCallout } = this.context;
    const { _name: [{ label: name }] } = values;
    try {
      await this.rolesMappingService.save(name, formikToRoleMapping(values));
      setSubmitting(false);
      history.push(APP_PATH.ROLE_MAPPINGS);
    } catch (error) {
      setSubmitting(false);
      triggerErrorCallout(error);
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
    const { history, location } = this.props;
    const {
      triggerInspectJsonFlyout,
      onComboBoxOnBlur,
      onComboBoxChange,
      onComboBoxCreateOption,
    } = this.context;
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
      >
        {({ values, handleSubmit, isSubmitting }) => {
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
                  triggerInspectJsonFlyout({
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

              <FormikComboBox
                name="_ips"
                formRow
                rowProps={{
                  label: ipsText,
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
      </Formik>
    );
  }
}

CreateRoleMapping.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default CreateRoleMapping;
