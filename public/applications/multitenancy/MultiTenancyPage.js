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

import { APP_NAME } from './utils/constants';
import { API_ROOT } from '../../utils/constants';

import {
  EuiButton,
  EuiButtonEmpty,
  EuiInMemoryTable,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiTitle,
  EuiSpacer,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCallOut,
  EuiText,
  EuiPageHeader,
} from '@elastic/eui';

import { MainContext } from './contexts/MainContextProvider';

import {
  nameHeader,
  permissionsHeader,
  readOnlyLabel,
  readWriteLabel,
  mtActiveTenantLabel,
  mtPageHeader,
  mtConfigErrorHeader,
  mtRolesFlyoutTitle,
  selectedTenantButtonLabel,
  selectTenantButtonLabel,
  showDashboardLabel,
  showVisualizationLabel,
  theTenantHasNotBeenCreatedYet,
} from './utils/i18n/multitenancy_labels';
import { LicenseWarningCallout } from '../components';

export class MultiTenancyPage extends Component {
  static contextType = MainContext;

  constructor(props, context) {
    super(props, context);

    this.configService = context.configService;

    this.state = {
      isLoading: true,
      callout: null,
      showRolesFlyout: false,
      userName: '',
      tenants: [],
      uiTenants: [],
      roles: '',
      rolesArray: [],
      errorMessage: null,
      currentTenant: '',
      currentTenantLabel: '',
      //
      userHasDashboardOnlyRole: false,
      globalUserWriteable: false,
      globalUserVisible: false,
      showSearch: this.configService.get('searchguard.multitenancy.enable_filter'),
      showRoles: this.configService.get('searchguard.multitenancy.show_roles'),
    };

    const { addErrorToast } = context;

    this.fetchMultiTenancyInfo(addErrorToast);
    this.fetchTenants(addErrorToast);
  }

  fetchMultiTenancyInfo(addErrorToast) {
    const { httpClient } = this.context;
    httpClient.get(`${API_ROOT}/multitenancy/info`).then(
      (response) => {
        const kibana_server_user = this.configService.get('elasticsearch.username');
        const kibana_index = this.configService.get('kibana.index');
        // sanity checks, check that configuration is correct on
        // both ES and KI side
        const mtinfo = response.data;
        let errorMessage = null;

        if (!mtinfo.kibana_mt_enabled) {
          errorMessage =
            'It seems that the Multitenancy module is not installed on your Elasticsearch cluster, or it is disabled. Multitenancy will not work, please check your installation.';
        }

        if (mtinfo.kibana_server_user !== kibana_server_user) {
          errorMessage =
            'Mismatch between the configured Kibana server usernames on Elasticsearch and Kibana, multitenancy will not work! ' +
            'Configured username on Kibana: "' +
            kibana_server_user +
            '", configured username on Elasticsearch: "' +
            mtinfo.kibana_server_user +
            '"';
        }

        if (mtinfo.kibana_index !== kibana_index) {
          errorMessage =
            'Mismatch between the configured Kibana index names on Elasticsearch and Kibana, multitenancy will not work! ' +
            'Configured index name on Kibana: "' +
            kibana_index +
            '", configured index name on Elasticsearch: "' +
            mtinfo.kibana_index +
            '"';
        }

        if (errorMessage) {
          this.setState({
            errorMessage,
          });
        }
      },
      (error) => {
        addErrorToast(error, { errorMessage: 'Unable to load multitenancy info.' });
      }
    );
  }

  async fetchTenants(addErrorToast) {
    const { httpClient } = this.context;

    try {
      const [
        { data: tenantinfo },
        { data: currentTenant },
        { data: authinfo },
      ] = await Promise.all([
        httpClient.get(`${API_ROOT}/multitenancy/tenantinfo`),
        httpClient.get(`${API_ROOT}/multitenancy/tenant`),
        httpClient.get(`${API_ROOT}/auth/authinfo`),
      ]);

      const tenantToIndexMap = Object.entries(tenantinfo).reduce((acc, [key, value]) => {
        acc[value] = key;
        return acc;
      }, {});

      // remove users own tenant, will be replaced with __user__
      // since we want to display tenant name with "Private"
      const userName = authinfo.user_name;
      const allTenants = authinfo.sg_tenants;
      const {
        enable_global: globalEnabled,
        enable_private: privateEnabled,
      } = this.configService.get('searchguard.multitenancy.tenants');
      const readOnlyConfig = this.configService.get('searchguard.readonly_mode');

      let userHasDashboardOnlyRole = false;
      try {
        userHasDashboardOnlyRole = authinfo.sg_roles.filter((role) => {
          return readOnlyConfig.roles.indexOf(role) > -1;
        }).length
          ? true
          : false;
      } catch (error) {
        // Ignore for now
        console.warn('Could not check read only mode roles', error);
      }

      // If SGS_GLOBAL_TENANT is not available in tenant list, it needs to be
      // removed from UI display as well
      let globalUserWriteable = false;
      let globalUserVisible = false;
      delete allTenants[userName];

      // delete the SGS_GLOBAL_TENANT for the moment. We fall back the GLOBAL until
      // RBAC is rolled out completely.
      if (authinfo.sg_tenants.hasOwnProperty('SGS_GLOBAL_TENANT') && globalEnabled) {
        globalUserWriteable = authinfo.sg_tenants.SGS_GLOBAL_TENANT && !userHasDashboardOnlyRole;
        globalUserVisible = true;
      }
      delete authinfo.sg_tenants.SGS_GLOBAL_TENANT;

      // sort tenants by putting the keys in an array first
      const tenantKeys = [];
      let k;

      for (k in allTenants) {
        if (allTenants.hasOwnProperty(k)) {
          tenantKeys.push(k);
        }
      }
      tenantKeys.sort();

      const uiTenants = tenantKeys.map((tenant) => ({
        id: tenant,
        label: tenant,
        canWrite: userHasDashboardOnlyRole ? false : allTenants[tenant],
        rowProps: {
          isSelected: true,
        },
        isDisabled: !tenantToIndexMap[tenant] && !allTenants[tenant],
      }));

      if (privateEnabled && !userHasDashboardOnlyRole) {
        uiTenants.unshift({
          id: '__user__',
          label: 'Private',
          testLabel: 'private',
          canWrite: true,
        });
      }

      // @todo Why is this called globalUserVisible and not globalTenantVisible?
      if (globalUserVisible) {
        uiTenants.unshift({
          id: '',
          label: 'Global',
          testLabel: 'global',
          canWrite: globalUserWriteable,
        });
      }

      this.setState({
        userName,
        uiTenants,
        tenants: allTenants,
        roles: authinfo.sg_roles.join(', '),
        rolesArray: authinfo.sg_roles,
        userHasDashboardOnlyRole,
        globalUserWriteable,
        globalUserVisible,
      });

      this.setCurrentTenant(currentTenant, userName);
    } catch (error) {
      addErrorToast(error);
    }

    this.setState({
      isLoading: false,
    });
  }

  setCurrentTenant(tenant, userName) {
    const tenantName = this.resolveTenantName(tenant, userName);
    const currentTenantLabel = mtActiveTenantLabel(tenantName);
    this.setState({
      currentTenant: tenant,
      currentTenantLabel,
    });
  }

  selectTenant(tenant, redirectTo = null) {
    const { userName } = this.state;
    const {
      addSuccessToast,
      addErrorToast,
      httpClient,
      chromeHelper,
      configService,
    } = this.context;

    httpClient
      .post(`${API_ROOT}/multitenancy/tenant`, {
        tenant: tenant,
        username: userName,
      })
      .then(
        (response) => {
          const currentTenant = response.data;
          configService.fetchConfig();
          this.setCurrentTenant(currentTenant, userName);

          // clear lastUrls from nav links to avoid not found errors.
          // Make sure that the app is really enabled before accessing.
          // If chromeWrapper.resetLastSubUrl is used, the check for enabled apps is redundant.
          // Keeping this to make the merges a bit easier.
          const appsToReset = ['visualize', 'dashboards', 'discover', 'timelion'];
          chromeHelper.getNavLinks().forEach((navLink) => {
            if (appsToReset.indexOf(navLink.id) > -1) {
              chromeHelper.resetLastUrl(navLink.id);
            }
          });

          // clear last urls, but leave our own items untouched. Take safe mutation approach.
          const lastUrls = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key.startsWith('lastUrl')) {
              lastUrls.push(key);
            }
          }
          for (let i = 0; i < lastUrls.length; i++) {
            sessionStorage.removeItem(lastUrls[i]);
          }
          // to be on the safe side for future changes, clear localStorage as well
          localStorage.clear();

          // redirect to either Visualize or Dashboard depending on user selection.
          if (redirectTo) {
            if (redirectTo === 'vis') {
              window.location.href = chromeHelper.getNavLinkById('visualize').url;
            }
            if (redirectTo === 'dash') {
              window.location.href = chromeHelper.getNavLinkById('dashboards').url;
            }
          } else {
            const successText =
              'Selected tenant is now ' + this.resolveTenantName(response.data, userName);
            addSuccessToast(successText, 'Tenant changed');

            // We may need to redirect the user if they are in
            // a non default space before switching tenants
            const pathWithoutSpace =
              httpClient.basePath.serverBasePath +
              httpClient.basePath.remove(window.location.pathname);

            // Always reload after switching tenants manually.
            // Otherwise we may see weird issues with default index patterns and spaces.
            window.location.href = pathWithoutSpace;
          }
        },
        (error) => {
          addErrorToast(error);
        }
      );
  }

  renderFlyout() {
    const { userName, rolesArray, showRolesFlyout } = this.state;

    if (!showRolesFlyout) {
      return null;
    }

    return (
      <EuiFlyout
        size="s"
        onClose={() => this.setState({ showRolesFlyout: false })}
        aria-labelledby="rolesFlyoutTItle"
      >
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="rolesFlyoutTItle">{mtRolesFlyoutTitle(userName)}</h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiText>
            <ul>
              {rolesArray.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </EuiText>
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }

  resolveTenantName(tenant, userName) {
    if (!tenant || tenant === 'undefined') {
      return 'Global';
    }
    if (tenant === userName || tenant === '__user__') {
      return 'Private';
    } else {
      return tenant;
    }
  }

  renderRolesButton() {
    const { showRoles, userName } = this.state;

    if (!showRoles) {
      return null;
    }

    return (
      <EuiFlexItem grow={false}>
        <EuiButton
          onClick={() => {
            this.setState({ showRolesFlyout: true });
          }}
          flush="right"
          iconType="user"
          size="s"
        >
          {userName}
        </EuiButton>
      </EuiFlexItem>
    );
  }

  render() {
    const {
      isLoading,
      currentTenant,
      currentTenantLabel,
      userHasDashboardOnlyRole,
      showSearch,
      errorMessage,
      uiTenants,
    } = this.state;

    const columns = [
      {
        field: 'label',
        name: nameHeader,
        render: (label, uiTenant) => {
          const testSuffix = uiTenant.testLabel || uiTenant.label;
          return (
            <EuiFlexGroup direction="column" gutterSize="xs" alignItems="flexStart">
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  isDisabled={uiTenant.isDisabled}
                  id={'sg.link.select.' + testSuffix}
                  onClick={() => {
                    this.selectTenant(uiTenant.id);
                  }}
                >
                  {label}
                </EuiButtonEmpty>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                {uiTenant.isDisabled && (
                  <EuiCallOut
                    data-test-subj={`sg.mt.theTenantHasNotBeenCreatedYet.${testSuffix}`}
                    title={theTenantHasNotBeenCreatedYet}
                    iconType="help"
                    color="warning"
                  />
                )}
              </EuiFlexItem>
            </EuiFlexGroup>
          );
        },
      },
      {
        field: 'canWrite',
        name: permissionsHeader,
        render: (canWrite, uiTenant) => {
          const testSuffix = uiTenant.testLabel || uiTenant.label;

          return (
            <div id={'sg.permission.' + testSuffix}>
              {canWrite ? readWriteLabel : readOnlyLabel}
            </div>
          );
        },
      },
      {
        name: '',
        render: (uiTenant) => {
          const testSuffix = uiTenant.testLabel || uiTenant.label;
          return (
            <div style={{ textAlign: 'right' }}>
              <EuiButton
                isDisabled={uiTenant.isDisabled}
                id={'sg.button.show_dashboard.' + testSuffix}
                size="s"
                fill
                color="primary"
                onClick={() => this.selectTenant(uiTenant.id, 'dash')}
              >
                {showDashboardLabel}
              </EuiButton>
            </div>
          );
        },
      },
      {
        name: '',
        render: (uiTenant) => {
          if (userHasDashboardOnlyRole) {
            return null;
          }

          const testSuffix = uiTenant.testLabel || uiTenant.label;
          return (
            <div style={{ textAlign: 'right' }}>
              <EuiButton
                isDisabled={uiTenant.isDisabled}
                id={'sg.button.show_visualization.' + testSuffix}
                size="s"
                fill
                color="primary"
                onClick={() => this.selectTenant(uiTenant.id, 'vis')}
              >
                {showVisualizationLabel}
              </EuiButton>
            </div>
          );
        },
      },
      {
        name: '',
        align: 'right',
        render: (uiTenant) => {
          const testSuffix = uiTenant.testLabel || uiTenant.label;
          return (
            <EuiButton
              isDisabled={uiTenant.isDisabled}
              id={'sg.button.select.' + testSuffix}
              size="s"
              fill
              disabled={uiTenant.id === currentTenant}
              color="primary"
              onClick={() => this.selectTenant(uiTenant.id)}
            >
              {uiTenant.id === currentTenant ? selectedTenantButtonLabel : selectTenantButtonLabel}
            </EuiButton>
          );
        },
      },
    ];

    const search = showSearch
      ? {
          box: {
            incremental: true,
          },
        }
      : false;

    const pagination = {
      initialPageSize: 50,
      pageSizeOptions: [10, 25, 50, 100],
    };

    return (
      <EuiPage id={APP_NAME}>
        <EuiPageBody className="sg-container">
          <EuiPageHeader>
            <EuiFlexGroup
              style={{ flexWrap: 'nowrap', width: '100%' }}
              alignItems="center"
              justifyContent="spaceBetween"
              wrap={false}
            >
              <EuiFlexItem>
                <EuiText size="s" style={{ fontWeight: 500 }}>
                  {mtPageHeader}
                </EuiText>
              </EuiFlexItem>
              {this.renderRolesButton()}
            </EuiFlexGroup>
          </EuiPageHeader>
          <EuiPageContent>
            <EuiPageContentBody className="sg-page-content-body">
              <LicenseWarningCallout configService={this.configService} />

              {this.renderFlyout()}
              <EuiTitle size="m">
                <h2 id="tenantLabel" style={{ textAlign: 'center' }}>
                  {currentTenantLabel}
                </h2>
              </EuiTitle>

              <EuiSpacer size="l" />

              {errorMessage && (
                <>
                  <EuiCallOut title={mtConfigErrorHeader} color="danger" iconType="alert">
                    <p>{errorMessage}</p>
                  </EuiCallOut>

                  <EuiSpacer size="l" />
                </>
              )}

              <EuiInMemoryTable
                items={uiTenants}
                rowProps={(uiTenant) => {
                  return {
                    isSelected: uiTenant.id === currentTenant,
                  };
                }}
                itemId="id"
                search={search}
                pagination={pagination}
                loading={isLoading}
                columns={columns}
                sorting={true}
                isSelectable={false}
              />
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    );
  }
}
