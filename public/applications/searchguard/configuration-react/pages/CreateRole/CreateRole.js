/*
 *    Copyright 2020 floragunn GmbH
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
  indexExclusionsText,
  clusterExclusionsText,
} from '../../utils/i18n/roles';
import { ROLES_ACTIONS } from '../../utils/constants';
import {
  Overview,
  ClusterPermissions,
  IndexPermissions,
  TenantPermissions,
  IndexExclusions,
  ClusterExclusions,
} from './components';
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

    const { location } = this.props;
    const { httpClient } = context;
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
        id: TABS.CLUSTER_EXCLUSIONS,
        name: clusterExclusionsText,
      },
      {
        id: TABS.INDEX_PERMISSIONS,
        name: indexPermissionsText,
      },
      {
        id: TABS.INDEX_EXCLUSIONS,
        name: indexExclusionsText,
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
    this.context.closeFlyout();
  };

  fetchData = async () => {
    const { id } = this.state;
    const { triggerErrorCallout } = this.context;

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

      this.setState({
        allClusterActionGroups,
        allIndexActionGroups,
        allTenantActionGroups,
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
      triggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  };

  onSubmit = async (values, { setSubmitting }) => {
    const { history } = this.props;
    const { triggerErrorCallout } = this.context;
    const { _name } = values;
    try {
      const doPreSave = false;
      await this.rolesService.save(_name, formikToRole(values), doPreSave);
      setSubmitting(false);
      history.goBack();
    } catch (error) {
      setSubmitting(false);
      triggerErrorCallout(error);
    }
  };

  handleSelectedTabChange = (selectedTabId) => this.setState({ selectedTabId });

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
      isLoading,
      resource,
      selectedTabId,
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
    const isClusterExclusionsTab = selectedTabId === TABS.CLUSTER_EXCLUSIONS;
    const isIndexPermissionsTab = selectedTabId === TABS.INDEX_PERMISSIONS;
    const isIndexExclusionsTab = selectedTabId === TABS.INDEX_EXCLUSIONS;
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
                  values={values}
                  isUpdatingName={isUpdatingName}
                  titleText={titleText}
                  {...this.props}
                />
              )}
              {isClusterPermissionsTab && (
                <ClusterPermissions
                  values={values}
                  allActionGroups={allClusterActionGroups}
                  allSinglePermissions={allClusterPermissions}
                  {...this.props}
                />
              )}
              {isClusterExclusionsTab && (
                <ClusterExclusions
                  values={values}
                  allActionGroups={allClusterActionGroups}
                  allSinglePermissions={allClusterPermissions}
                  {...this.props}
                />
              )}
              {isIndexPermissionsTab && (
                <IndexPermissions
                  values={values}
                  allActionGroups={allIndexActionGroups}
                  allSinglePermissions={allIndexPermissions}
                  {...this.props}
                />
              )}
              {isIndexExclusionsTab && (
                <IndexExclusions
                  values={values}
                  allActionGroups={allIndexActionGroups}
                  allSinglePermissions={allIndexPermissions}
                  {...this.props}
                />
              )}
              {isTenantPermissionsTab && (
                <TenantPermissions
                  values={values}
                  allTenants={allTenants}
                  allAppActionGroups={allTenantActionGroups}
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
};

export default CreateRole;
