import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import queryString from 'query-string';
import {
  EuiButton,
  EuiTabs,
  EuiTab,
  EuiSpacer
} from '@elastic/eui';
import { ContentPanel } from '../../components';
import {
  createRoleText,
  clusterPermissionsText,
  indexPermissionsText,
  tenantPermissionsText,
  updateRoleText,
  overviewText
} from '../../utils/i18n/roles';
import {
  cancelText,
  saveText
} from '../../utils/i18n/common';
import { APP_PATH, ROLES_ACTIONS } from '../../utils/constants';
import {
  Overview,
  ClusterPermissions,
  IndexPermissions,
  TenantPermissions
} from './components';
import { formikToRole, roleToFormik, indicesToUiIndices } from './utils';
import { TABS, ROLE, ROLE_MAPPING, APP_ACTION_GROUPS } from './utils/constants';
import {
  arrayToComboBoxOptions
} from '../../utils/helpers';
import { SystemService } from '../../services';
import { actionGroupsToUiActionGroups } from '../CreateActionGroup/utils';

class CreateRole extends Component {
  constructor(props) {
    super(props);

    const { location, rolesService, httpClient } = this.props;
    const { id } = queryString.parse(location.search);
    this.state = {
      id,
      isEdit: !!id,
      resource: roleToFormik({ resource: ROLE, roleMapping: ROLE_MAPPING }),
      isLoading: true,
      selectedTabId: TABS.OVERVIEW,
      allActionGroups: [],
      allSinglePermissions: [],
      allIndices: [],
      allAppActionGroups: arrayToComboBoxOptions(APP_ACTION_GROUPS)
    };

    this.backendService = rolesService;
    this.systemService = new SystemService(httpClient);

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

  fetchData = async () => {
    const { id } = this.state;
    const { onTriggerErrorCallout, rolesMappingService, actionGroupsService } = this.props;
    try {
      this.setState({ isLoading: true });
      if (id) {
        let resource = await this.backendService.get(id);
        const roleMapping = await rolesMappingService.getSilent(id, false);
        resource = roleToFormik({ resource, id, roleMapping });

        const { data: actionGroups } = await actionGroupsService.list();
        const { allActionGroups, allSinglePermissions } = actionGroupsToUiActionGroups(actionGroups);
        const { data: allIndices } = await this.systemService.getIndices();

        this.setState({
          resource,
          allActionGroups,
          allSinglePermissions,
          allIndices: indicesToUiIndices(allIndices)
        });
      } else {
        this.setState({ resource: roleToFormik({ resource: ROLE, roleMapping: ROLE_MAPPING }), isEdit: !!id });
      }
    } catch(error) {
      onTriggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  }

  onSubmit = async (values, { setSubmitting }) => {
    const { history, onTriggerErrorCallout } = this.props;
    const { _name } = values;
    try {
      await this.backendService.save(_name, formikToRole(values));
      setSubmitting(false);
      history.push(APP_PATH.ROLES);
    } catch (error) {
      setSubmitting(false);
      onTriggerErrorCallout(error);
    }
  }

  handleSelectedTabChange = selectedTabId => this.setState({ selectedTabId })

  renderTabs = () => this.tabs.map((tab, i) => (
    <EuiTab
      key={i}
      isSelected={tab.id === this.state.selectedTabId}
      onClick={() => this.handleSelectedTabChange(tab.id)}
    >
      {tab.name}
    </EuiTab>
  ))

  renderSaveButton = ({ isSubmitting, handleSubmit }) => (
    <EuiButton isLoading={isSubmitting} iconType="save" fill onClick={handleSubmit}>
      {saveText}
    </EuiButton>
  )

  renderCancelButton = history => (
    <EuiButton
      onClick={() => history.push(APP_PATH.ROLES)}
    >
      {cancelText}
    </EuiButton>
  )

  render() {
    const { history, location } = this.props;
    const {
      isEdit,
      isLoading,
      resource,
      selectedTabId,
      allActionGroups,
      allSinglePermissions,
      allIndices,
      allAppActionGroups
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
                this.renderCancelButton(history),
                this.renderSaveButton({ handleSubmit, isSubmitting })
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
                  allActionGroups={allActionGroups}
                  allSinglePermissions={allSinglePermissions}
                  isEdit={isEdit}
                  {...this.props}
                />
              }
              {isIndexPermissionsTab &&
                <IndexPermissions
                  indexPermissions={values._indexPermissions}
                  allIndices={allIndices}
                  allActionGroups={allActionGroups}
                  allSinglePermissions={allSinglePermissions}
                  isEdit={isEdit}
                  {...this.props}
                />
              }
              {isTenantPermissionsTab &&
                <TenantPermissions
                  allAppActionGroups={allAppActionGroups}
                  tenantPermissions={values._tenantPermissions}
                  values={values}
                  isEdit={isEdit}
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
  rolesMappingService: PropTypes.object.isRequired,
  actionGroupsService: PropTypes.object.isRequired,
  onTriggerInspectJsonFlyout: PropTypes.func.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired,
  httpClient: PropTypes.func.isRequired
};

export default CreateRole;
