/* eslint-disable @kbn/eslint/require-license-header */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import queryString from 'query-string';
import { EuiTabs, EuiTab, EuiSpacer } from '@elastic/eui';
import { ContentPanel, CancelButton, SaveButton } from '../../components';
import {
  createRoleText,
  clusterPermissionsText,
  indexPermissionsText,
  tenantPermissionsText,
  updateRoleText,
  overviewText,
} from '../../utils/i18n/roles';
import { ROLES_ACTIONS } from '../../utils/constants';
import { Overview, ClusterPermissions, IndexPermissions, TenantPermissions } from './components';
import {
  formikToRole,
  roleToFormik,
  actionGroupsToUiClusterIndexTenantActionGroups,
  tenantsToUiTenants,
} from './utils';
import { TABS, ROLE, ROLE_MAPPING } from './utils/constants';
import { getAllUiIndexPermissions, getAllUiClusterPermissions } from '../../utils/helpers';
import {
  ElasticsearchService,
  RolesService,
  RolesMappingService,
  ActionGroupsService,
  TenantsService,
} from '../../services';

import { Context } from '../../Context';

class CreateRole extends Component {
  static contextType = Context;

  constructor(props, context) {
    super(props, context);

    const { location, httpClient } = this.props;
    const { id } = queryString.parse(location.search);
    this.esService = new ElasticsearchService(httpClient);
    this.rolesService = new RolesService(httpClient);
    this.rolesMappingService = new RolesMappingService(httpClient);
    this.actionGroupsService = new ActionGroupsService(httpClient);
    this.tenantsService = new TenantsService(httpClient);
    this.configService = context.configService;

    this.state = {
      id,
      isEdit: !!id,
      resource: roleToFormik({ resource: ROLE, roleMapping: ROLE_MAPPING }),
      isLoading: true,
      selectedTabId: TABS.OVERVIEW,
      allIndexPermissions: getAllUiIndexPermissions(),
      allClusterPermissions: getAllUiClusterPermissions(),
      allIndexActionGroups: [],
      allClusterActionGroups: [],
      allTenantActionGroups: [],
      allTenants: [],
      isFlsEnabled: true,
      isDlsEnabled: true,
      isAnonymizedFieldsEnabled: true,
      isMultiTenancyEnabled: true,
    };

    this.tabs = [
      {
        id: TABS.OVERVIEW,
        name: overviewText,
      },
      {
        id: TABS.CLUSTER_PERMISSIONS,
        name: clusterPermissionsText,
      },
      {
        id: TABS.INDEX_PERMISSIONS,
        name: indexPermissionsText,
      },
      {
        id: TABS.TENANT_PERMISSIONS,
        name: tenantPermissionsText,
      },
    ];
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillUnmount = () => {
    this.props.onTriggerInspectJsonFlyout(null);
  };

  fetchData = async () => {
    const { id } = this.state;
    const { onTriggerErrorCallout } = this.props;

    try {
      this.setState({ isLoading: true });

      const [{ data: actionGroups }, { data: allTenants }] = await Promise.all([
        this.actionGroupsService.list(),
        this.tenantsService.list(),
      ]);

      const {
        allClusterActionGroups,
        allIndexActionGroups,
        allTenantActionGroups,
      } = actionGroupsToUiClusterIndexTenantActionGroups(actionGroups);

      const isDlsEnabled = this.configService.dlsFlsEnabled();
      const isFlsEnabled = isDlsEnabled;
      const isMultiTenancyEnabled = this.configService.multiTenancyEnabled();
      const isAnonymizedFieldsEnabled = this.configService.complianceFeaturesEnabled();

      this.setState({
        allClusterActionGroups,
        allIndexActionGroups,
        allTenantActionGroups,
        isDlsEnabled,
        isFlsEnabled,
        isAnonymizedFieldsEnabled,
        isMultiTenancyEnabled,
        allTenants: tenantsToUiTenants(allTenants),
      });

      if (id) {
        const resource = await this.rolesService.get(id);
        const roleMapping = await this.rolesMappingService.getSilent(id);
        this.setState({ resource: roleToFormik({ resource, id, roleMapping }) });
      } else {
        this.setState({
          resource: roleToFormik({ resource: ROLE, roleMapping: ROLE_MAPPING }),
          isEdit: !!id,
        });
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
      const doPreSave = false;
      await this.rolesService.save(_name, formikToRole(values), doPreSave);
      setSubmitting(false);
      history.goBack();
    } catch (error) {
      setSubmitting(false);
      onTriggerErrorCallout(error);
    }
  };

  handleSelectedTabChange = selectedTabId => this.setState({ selectedTabId });

  renderTabs = () =>
    this.tabs.map((tab, i) => (
      <EuiTab
        data-test-subj={`sgRoleTab-${tab.id}`}
        key={i}
        isSelected={tab.id === this.state.selectedTabId}
        onClick={() => this.handleSelectedTabChange(tab.id)}
      >
        {tab.name}
      </EuiTab>
    ));

  render() {
    const { history, location } = this.props;
    const {
      isEdit,
      isLoading,
      resource,
      selectedTabId,
      isDlsEnabled,
      isFlsEnabled,
      isMultiTenancyEnabled,
      isAnonymizedFieldsEnabled,
      allIndexPermissions,
      allClusterPermissions,
      allIndexActionGroups,
      allClusterActionGroups,
      allTenantActionGroups,
      allTenants,
    } = this.state;
    const { action, id } = queryString.parse(location.search);
    const updateRole = action === ROLES_ACTIONS.UPDATE_ROLE;
    const titleText = updateRole ? updateRoleText : createRoleText;
    const isOverviewTab = selectedTabId === TABS.OVERVIEW;
    const isClusterPermissionsTab = selectedTabId === TABS.CLUSTER_PERMISSIONS;
    const isIndexPermissionsTab = selectedTabId === TABS.INDEX_PERMISSIONS;
    const isTenantPermissionsTab = selectedTabId === TABS.TENANT_PERMISSIONS;

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
                <CancelButton onClick={() => history.goBack()} />,
                <SaveButton isLoading={isSubmitting} onClick={handleSubmit} />,
              ]}
            >
              <EuiTabs display="condensed">{this.renderTabs()}</EuiTabs>

              <EuiSpacer />

              {isOverviewTab && (
                <Overview
                  isUpdatingName={isUpdatingName}
                  values={values}
                  titleText={titleText}
                  isEdit={isEdit}
                  {...this.props}
                />
              )}
              {isClusterPermissionsTab && (
                <ClusterPermissions
                  isAdvanced={values._isClusterPermissionsAdvanced}
                  allActionGroups={allClusterActionGroups}
                  allSinglePermissions={allClusterPermissions}
                  isEdit={isEdit}
                  {...this.props}
                />
              )}
              {isIndexPermissionsTab && (
                <IndexPermissions
                  indexPermissions={values._indexPermissions}
                  allActionGroups={allIndexActionGroups}
                  allSinglePermissions={allIndexPermissions}
                  isEdit={isEdit}
                  isDlsEnabled={isDlsEnabled}
                  isFlsEnabled={isFlsEnabled}
                  isAnonymizedFieldsEnabled={isAnonymizedFieldsEnabled}
                  {...this.props}
                />
              )}
              {isTenantPermissionsTab && (
                <TenantPermissions
                  allTenants={allTenants}
                  allAppActionGroups={allTenantActionGroups}
                  tenantPermissions={values._tenantPermissions}
                  values={values}
                  isEdit={isEdit}
                  isMultiTenancyEnabled={isMultiTenancyEnabled}
                  {...this.props}
                />
              )}
            </ContentPanel>
          );
        }}
      </Formik>
    );
  }
}

CreateRole.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  onTriggerInspectJsonFlyout: PropTypes.func.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired,
  httpClient: PropTypes.object.isRequired,
};

export default CreateRole;
