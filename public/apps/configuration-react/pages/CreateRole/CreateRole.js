import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import queryString from 'query-string';
import {
  EuiTabs,
  EuiTab,
  EuiSpacer
} from '@elastic/eui';
import {
  ContentPanel,
  CancelButton,
  SaveButton
} from '../../components';
import {
  createRoleText,
  clusterPermissionsText,
  indexPermissionsText,
  tenantPermissionsText,
  updateRoleText,
  overviewText
} from '../../utils/i18n/roles';
import { ROLES_ACTIONS } from '../../utils/constants';
import {
  Overview,
  ClusterPermissions,
  IndexPermissions,
  TenantPermissions
} from './components';
import {
  formikToRole,
  roleToFormik,
  indicesToUiIndices,
  actionGroupsToUiClusterIndexTenantActionGroups,
  tenantsToUiTenants
} from './utils';
import { TABS, ROLE, ROLE_MAPPING } from './utils/constants';
import { getAllUiIndexPermissions, getAllUiClusterPermissions } from '../../utils/helpers';
import { ElasticsearchService } from '../../services';

class CreateRole extends Component {
  constructor(props) {
    super(props);

    const { location, httpClient } = this.props;
    const { id } = queryString.parse(location.search);
    this.esService = new ElasticsearchService(httpClient);

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
      allIndices: [],
      isFlsEnabled: true,
      isDlsEnabled: true,
      isAnonymizedFieldsEnabled: true,
      isMultiTenancyEnabled: true,
    };

    this.tabs = [
      {
        id: TABS.OVERVIEW,
        name: overviewText
      },
      {
        id: TABS.CLUSTER_PERMISSIONS,
        name: clusterPermissionsText
      },
      {
        id: TABS.INDEX_PERMISSIONS,
        name: indexPermissionsText
      },
      {
        id: TABS.TENANT_PERMISSIONS,
        name: tenantPermissionsText
      }
    ];
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
    const {
      onTriggerErrorCallout,
      roleMappingsService,
      actionGroupsService,
      systemstateService,
      rolesService,
      tenantsService
    } = this.props;

    try {
      this.setState({ isLoading: true });
      const { data: actionGroups } = await actionGroupsService.list();
      const {
        allClusterActionGroups,
        allIndexActionGroups,
        allTenantActionGroups
      } = actionGroupsToUiClusterIndexTenantActionGroups(actionGroups);
      const { data: allIndices } = await this.esService.getIndices();
      const { data: allTenants } = await tenantsService.list();

      // TODO: Refactor this to get stuff without side effects
      await systemstateService.loadSystemInfo();
      const isDlsEnabled = systemstateService.dlsFlsEnabled();
      const isFlsEnabled = isDlsEnabled;
      const isMultiTenancyEnabled = systemstateService.multiTenancyEnabled();
      const isAnonymizedFieldsEnabled = systemstateService.complianceFeaturesEnabled();

      this.setState({
        allClusterActionGroups,
        allIndexActionGroups,
        allTenantActionGroups,
        isDlsEnabled,
        isFlsEnabled,
        isAnonymizedFieldsEnabled,
        isMultiTenancyEnabled,
        allIndices: indicesToUiIndices(allIndices),
        allTenants: tenantsToUiTenants(allTenants)
      });

      if (id) {
        const resource = await rolesService.get(id);
        const roleMapping = await roleMappingsService.getSilent(id, false);
        this.setState({ resource: roleToFormik({ resource, id, roleMapping }) });
      } else {
        this.setState({ resource: roleToFormik({ resource: ROLE, roleMapping: ROLE_MAPPING }), isEdit: !!id });
      }
    } catch(error) {
      onTriggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  }

  onSubmit = async (values, { setSubmitting }) => {
    const { history, onTriggerErrorCallout, rolesService } = this.props;
    const { _name } = values;
    try {
      const doPreSave = false;
      await rolesService.save(_name, formikToRole(values), doPreSave);
      setSubmitting(false);
      history.goBack();
    } catch (error) {
      setSubmitting(false);
      onTriggerErrorCallout(error);
    }
  }

  handleSelectedTabChange = selectedTabId => this.setState({ selectedTabId })

  renderTabs = () => this.tabs.map((tab, i) => (
    <EuiTab
      data-test-subj={`sgRoleTab-${tab.id}`}
      key={i}
      isSelected={tab.id === this.state.selectedTabId}
      onClick={() => this.handleSelectedTabChange(tab.id)}
    >
      {tab.name}
    </EuiTab>
  ))

  render() {
    const {
      history,
      location,
      httpClient,
      onComboBoxChange,
      onComboBoxOnBlur,
      onComboBoxCreateOption,
      onTriggerConfirmDeletionModal
    } = this.props;
    const {
      isEdit,
      isLoading,
      resource,
      selectedTabId,
      allIndices,
      isDlsEnabled,
      isFlsEnabled,
      isMultiTenancyEnabled,
      isAnonymizedFieldsEnabled,
      allIndexPermissions,
      allClusterPermissions,
      allIndexActionGroups,
      allClusterActionGroups,
      allTenantActionGroups,
      allTenants
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
        render={({ values, handleSubmit, isSubmitting }) => {
          const isUpdatingName = id !== values._name;

          return (
            <ContentPanel
              title={titleText}
              isLoading={isLoading}
              actions={[
                (<CancelButton onClick={() => history.goBack()} />),
                (<SaveButton isLoading={isSubmitting} onClick={handleSubmit} />)
              ]}
            >
              <EuiTabs display="condensed">{this.renderTabs()}</EuiTabs>

              <EuiSpacer />

              {isOverviewTab &&
                <Overview
                  isUpdatingName={isUpdatingName}
                  values={values}
                  titleText={titleText}
                  isEdit={isEdit}
                  {...this.props}
                />
              }
              {isClusterPermissionsTab &&
                <ClusterPermissions
                  isAdvanced={values._isClusterPermissionsAdvanced}
                  allActionGroups={allClusterActionGroups}
                  allSinglePermissions={allClusterPermissions}
                  onComboBoxChange={onComboBoxChange}
                  onComboBoxOnBlur={onComboBoxOnBlur}
                  onComboBoxCreateOption={onComboBoxCreateOption}
                  isEdit={isEdit}
                  {...this.props}
                />
              }
              {isIndexPermissionsTab &&
                <IndexPermissions
                  httpClient={httpClient}
                  indexPermissions={values._indexPermissions}
                  allIndices={allIndices}
                  allActionGroups={allIndexActionGroups}
                  allSinglePermissions={allIndexPermissions}
                  isEdit={isEdit}
                  isDlsEnabled={isDlsEnabled}
                  isFlsEnabled={isFlsEnabled}
                  isAnonymizedFieldsEnabled={isAnonymizedFieldsEnabled}
                  onComboBoxChange={onComboBoxChange}
                  onComboBoxOnBlur={onComboBoxOnBlur}
                  onComboBoxCreateOption={onComboBoxCreateOption}
                  onTriggerConfirmDeletionModal={onTriggerConfirmDeletionModal}
                  {...this.props}
                />
              }
              {isTenantPermissionsTab &&
                <TenantPermissions
                  allTenants={allTenants}
                  allAppActionGroups={allTenantActionGroups}
                  tenantPermissions={values._tenantPermissions}
                  values={values}
                  isEdit={isEdit}
                  isMultiTenancyEnabled={isMultiTenancyEnabled}
                  onComboBoxChange={onComboBoxChange}
                  onComboBoxOnBlur={onComboBoxOnBlur}
                  onComboBoxCreateOption={onComboBoxCreateOption}
                  onTriggerConfirmDeletionModal={onTriggerConfirmDeletionModal}
                  {...this.props}
                />
              }
            </ContentPanel>
          );
        }}
      />
    );
  }
}

CreateRole.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  rolesService: PropTypes.object.isRequired,
  roleMappingsService: PropTypes.object.isRequired,
  actionGroupsService: PropTypes.object.isRequired,
  systemstateService: PropTypes.object.isRequired,
  tenantsService: PropTypes.object.isRequired,
  onTriggerInspectJsonFlyout: PropTypes.func.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired,
  httpClient: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired
};

export default CreateRole;
