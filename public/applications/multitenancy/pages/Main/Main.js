import React, { Component, Fragment } from 'react';

import { sgContext } from '../../../../utils/sgContext';

import { APP_NAME } from '../../../../../utils/signals/constants';
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
  EuiCallOut, EuiText, EuiListGroup, EuiListGroupItem, EuiPageHeader
} from '@elastic/eui';
// @todo Add chromeWrapper back in
//import { chromeWrapper } from '../../../../services/chrome_wrapper';
import { MainContext } from '../../contexts/MainContextProvider';
//import { LocalStorageService } from '../../../configuration-react/services';
import { get, isEmpty, map } from 'lodash';
/*
import { CALLOUTS, LOCAL_STORAGE } from '../../../configuration-react/utils/constants';
import { checkIfLicenseValid } from '../../../configuration-react/utils/helpers';
import {
  apiAccessStateForbiddenText,
  apiAccessStateNotEnabledText,
  sgLicenseNotValidText
} from '../../../configuration-react/utils/i18n/main';
import { Callout } from '../../../components';


import { API_ACCESS_STATE } from '../../../configuration-react/pages/Main/utils/constants';
 */
import {
  nameHeader,
  permissionsHeader,
  readOnlyLabel,
  readWriteLabel,
  mtActiveTenantLabel,
  mtPageHeader,
  mtConfigErrorHeader,
  mtRolesFlyoutTitle,
  globalTenantLabel,
  privateTenantLabel,
  selectedTenantButtonLabel, selectTenantButtonLabel, showDashboardLabel, showVisualizationLabel
} from "../../utils/i18n/multitenancy_labels";
import { LicenseWarningCallout } from '../../../../apps/components';

export default class Main extends Component {
  static contextType = MainContext;

  constructor(props, context) {
    super(props, context);

    // @todo It seems like the http client is handling the base path automatically?
    const APP_ROOT = '';
    this.API_ROOT = `${APP_ROOT}/api/v1`;

    this.config = sgContext.config;

    // @todo Add this back? Ask Sergii what it's for
    //this.localStorage = new LocalStorageService();
    //if (isEmpty(this.localStorage.cache)) this.localStorage.cache = LOCAL_STORAGE;

    this.state = {
      isLoading: true,
      callout: null,
      showRolesFlyout: false,
      userName: '',
      tenants: [],
      tenantKeys: [],
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
      showSearch: this.config.get('multitenancy.enable_filter'),
      showRoles: this.config.get('multitenancy.show_roles'),
    };

    const { addErrorToast } = context;

    this.fetchMultiTenancyInfo(addErrorToast);
    this.fetchTenants(addErrorToast);
  }

  componentDidMount() {
  }

  handleTriggerCallout = callout => {
    this.setState({ callout });
  }

  handleTriggerErrorCallout = error => {
    console.error(error);
    error = error.data || error;
    this.handleTriggerCallout({
      type: CALLOUTS.ERROR_CALLOUT,
      payload: get(error, 'message', error)
    });
  }

  fetchMultiTenancyInfo(addErrorToast) {
    const { httpClient } = this.props;
    httpClient.get(`${this.API_ROOT}/multitenancy/info`)
      .then(
        (response) => {
          const kibana_server_user = this.config.get('elasticsearch.username');
          const kibana_index = this.config.get('kibana.index');

          // sanity checks, check that configuration is correct on
          // both ES and KI side
          const mtinfo = response.data;
          let errorMessage = null;

          // this.GLOBAL_USER_WRITEABLE = (!mtinfo.kibana_index_readonly && ! this.userHasDashboardOnlyRole);

          if(!mtinfo.kibana_mt_enabled) {
            errorMessage = 'It seems that the Multitenancy module is not installed on your Elasticsearch cluster, or it is disabled. Multitenancy will not work, please check your installation.';
          }

          if(mtinfo.kibana_server_user !== kibana_server_user) {
            errorMessage = 'Mismatch between the configured Kibana server usernames on Elasticsearch and Kibana, multitenancy will not work! ' +
                'Configured username on Kibana: "' + kibana_server_user + '", configured username on Elasticsearch: "' + mtinfo.kibana_server_user + '"';
          }

          if(mtinfo.kibana_index !== kibana_index) {
            errorMessage = 'Mismatch between the configured Kibana index names on Elasticsearch and Kibana, multitenancy will not work! ' +
                'Configured index name on Kibana: "'+ kibana_index +'", configured index name on Elasticsearch: "'+ mtinfo.kibana_index + '"';
          }
          if (errorMessage) {
            this.setState({
              errorMessage
            });
          }
        },
        (error) =>
        {
          addErrorToast(error, 'Unable to load multitenancy info.');
        }
      );
  }

  fetchTenants(addErrorToast) {
    const { httpClient } = this.props;


    httpClient.get(`${this.API_ROOT}/auth/authinfo`)
      .then(
        (response) => {
          // @todo Remove this hack
          console.warn('Got response', response)
          // remove users own tenant, will be replaced with __user__
          // since we want to display tenant name with "Private"
          const userName = response.data.user_name;
          const allTenants = response.data.sg_tenants;
          // @todo Add back dynamic values
          const globalEnabled = this.config.get('multitenancy.tenants.enable_global');
          const privateEnabled = this.config.get('multitenancy.tenants.enable_private');
          const readOnlyConfig = this.config.get('readonly_mode');


          // @todo
          let userHasDashboardOnlyRole = false;
          try {
            userHasDashboardOnlyRole = (response.data.sg_roles.filter((role) => {
              return (readOnlyConfig.roles.indexOf(role) > -1);
            }).length) ? true : false;
          } catch(error) {
            // Ignore for now
          }


          // If SGS_GLOBAL_TENANT is not available in tenant list, it needs to be
          // removed from UI display as well
          let globalUserWriteable = false;
          let globalUserVisible = false;
          delete allTenants[userName];

          // delete the SGS_GLOBAL_TENANT for the moment. We fall back the GLOBAL until
          // RBAC is rolled out completely.
          if(response.data.sg_tenants.hasOwnProperty("SGS_GLOBAL_TENANT") && globalEnabled) {
            globalUserWriteable = response.data.sg_tenants.SGS_GLOBAL_TENANT && !userHasDashboardOnlyRole;
            globalUserVisible = true;
          }
          delete response.data.sg_tenants["SGS_GLOBAL_TENANT"];

          // sort tenants by putting the keys in an array first
          const tenantKeys = [];
          let k;

          for (k in allTenants) {
            if (allTenants.hasOwnProperty(k)) {
              tenantKeys.push(k);
            }
          }
          tenantKeys.sort();

          const uiTenants = tenantKeys.map(tenant => ({
            id: tenant,
            label: tenant,
            canWrite: (userHasDashboardOnlyRole) ? false : allTenants[tenant],
            rowProps: {
              isSelected: true,
            }
          }));

          // @todo Check labels and rights
          if (privateEnabled && !userHasDashboardOnlyRole) {
            uiTenants.unshift({
              id: '__user__',
              label: 'Private',
              testLabel: 'private',
              canWrite: true
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

          /* Moved to state
          this.tenants = allTenants;
          this.tenantkeys = tenantKeys;
          this.roles = response.data.sg_roles.join(", ");
          this.rolesArray = response.data.sg_roles;

           */

          this.setState({
            userName,
            uiTenants,
            tenants: allTenants,
            tenantKeys,
            roles: response.data.sg_roles.join(', '),
            rolesArray: response.data.sg_roles,
            userHasDashboardOnlyRole,
            globalUserWriteable,
            globalUserVisible,

          })

          this.setState({
            isLoading: false,
          });

          httpClient.get(`${this.API_ROOT}/multitenancy/tenant`)
            .then(
              (response) => {
                const currentTenant = response.data;
                this.setCurrentTenant(currentTenant, userName);
              },
              (error) => {
                addErrorToast(error);
              }
            );
        },
        (error) =>
        {
          this.setState({
            isLoading: false,
          });

          addErrorToast(error, 'Unable to load authentication info.');
        }
      );
  }

  setCurrentTenant(tenant, userName) {
    const tenantName = this.resolveTenantName(tenant, userName);
    const currentTenantLabel = mtActiveTenantLabel(tenantName);
    this.setState({
      currentTenant: tenant,
      currentTenantLabel
    });
  }

  selectTenant(tenant, redirectTo = null) {
    const { httpClient } = this.props;
    const {
      userName
    } = this.state;
    const { addSuccessToast, addErrorToast } = this.context;

    httpClient.post(`${this.API_ROOT}/multitenancy/tenant`, {

        tenant: tenant,
        username: userName

      })
      .then(
        (response) => {
          const currentTenant = response.data;
          this.setCurrentTenant(currentTenant, userName);

          // clear lastUrls from nav links to avoid not found errors.
          // Make sure that the app is really enabled before accessing.
          // If chromeWrapper.resetLastSubUrl is used, the check for enabled apps is redundant.
          // Keeping this to make the merges a bit easier.
          const appsToReset = ['kibana:visualize', 'kibana:dashboard', 'kibana:discover', 'timelion'];

          /* todo Add back
          chromeWrapper.getNavLinks().forEach((navLink) => {
            if (appsToReset.indexOf(navLink.id) > -1) {
              chromeWrapper.resetLastSubUrl(navLink.id);
            }
          });

           */

          // clear last sub urls, but leave our own items untouched. Take safe mutation approach.
          let lastSubUrls = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            let key = sessionStorage.key(i);
            if (key.startsWith("lastSubUrl")) {
              lastSubUrls.push(key);
            }
          }
          for (let i = 0; i < lastSubUrls.length; i++) {
            sessionStorage.removeItem(lastSubUrls[i]);
          }
          // to be on the safe side for future changes, clear localStorage as well
          localStorage.clear();

          // redirect to either Visualize or Dashboard depending on user selection.
          // @todo Add back
          if(0 && redirectTo) {
            if (redirectTo === 'vis') {
              window.location.href = chromeWrapper.getNavLinkById("kibana:visualize").url;
            }
            if (redirectTo === 'dash') {
              window.location.href = chromeWrapper.getNavLinkById("kibana:dashboard").url;
            }
          } else {
            const successText = 'Selected tenant is now ' + this.resolveTenantName(response.data, userName);
            addSuccessToast(successText, 'Tenant changed');

            // We may need to redirect the user if they are in a non default space
            // before switching tenants
            // @todo Replace with dynamic
            // @todo Maybe this shouldn't be mapped to config - it is kind of
            // a dynamic state rather than a static config value
            const injected = {spacesEnabled: false, activeSpace: {}};
            const reload = injected.spacesEnabled;
            let basePath = httpClient.getBasePath();

            try {
              const space = injected.activeSpace.space;
              if (space && space.id !== 'default') {
                // Remove the spaces url part to avoid a Kibana redirect
                basePath = basePath.replace('/s/' + space.id, '');
              }
            } catch(error) {
              // Ignore
            }

            if (reload) {
              window.location.href = basePath + "/app/searchguard-multitenancy";
            }
          }
        },
        (error) =>
        {
          addErrorToast(error);
        }
      );


  }

  renderFlyout() {
    const {
      userName,
      rolesArray,
      showRolesFlyout,
    } = this.state;


    if (!showRolesFlyout) {
      return null;
    }


    return (
      <EuiFlyout size="s" onClose={() => this.setState({ showRolesFlyout: false })} aria-labelledby="rolesFlyoutTItle">
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="rolesFlyoutTItle">{mtRolesFlyoutTitle(userName)}</h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <EuiText>
            <ul>
              {rolesArray.map(role => (
                <li key={role}>
                  {role}
                </li>
              ))}
            </ul>
          </EuiText>

        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }

  resolveTenantName(tenant, userName) {
    console.warn(tenant, userName)
    if (!tenant || tenant === "undefined") {
      // @todo Label
      return 'Global';
    }
    if (tenant === userName || tenant === '__user__') {
      // @todo Label
      return 'Private';
    } else {
      return tenant;
    }
  }

  renderRolesButton() {
    const {
      showRoles,
      userName
    } = this.state;

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
      callout,
      errorMessage,
      uiTenants,
    } = this.state

    const columns = [
      {
        field: 'label',
        name: nameHeader,
        render: (label, uiTenant) => {
          const testSuffix = uiTenant.testLabel || uiTenant.label;
          return (
            <EuiButtonEmpty id={'sg.link.select.' + testSuffix} onClick={() => { this.selectTenant(uiTenant.id); }}>
              {label}
            </EuiButtonEmpty>
          );
        }
      },
      {
        field: 'canWrite',
        name: permissionsHeader,
        render: (canWrite, uiTenant) => {
          const testSuffix = uiTenant.testLabel || uiTenant.label;

          return (
            <div id={'sg.permission.' + testSuffix}>
              {(canWrite) ? readWriteLabel : readOnlyLabel }
            </div>
          );
        }
      },
      {
        name: '',
        render: (uiTenant) => {
          const testSuffix = uiTenant.testLabel || uiTenant.label;
          return (
            <div style={{ textAlign: 'right' }}>
              <EuiButton
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
        }
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
        }
      },
      {
        name: '',
        align: 'right',
        render: (uiTenant) => {
          const testSuffix = uiTenant.testLabel || uiTenant.label;
          return (
            <EuiButton
              id={'sg.button.select.' + testSuffix}
              size="s"
              fill
              disabled={(uiTenant.id === currentTenant)}
              color="primary"
              onClick={() => this.selectTenant(uiTenant.id)}
            >
              {(uiTenant.id === currentTenant) ? selectedTenantButtonLabel : selectTenantButtonLabel}
            </EuiButton>
          );
        }
      },
    ];

    const search = showSearch ? {
      box: {
        incremental: true
      }
    } : false;

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
              <LicenseWarningCallout httpClient={this.props.httpClient} />
              <div>
                @Todo
                <ul>
                  <li>Spaces</li>
                  <li>* - Callout etc.</li>
                  <li>* - Add references to old issues (JIRA) - history is gone now</li>
                  <li>* - All chrome related things, basePath, chromeWrapper, getInjected() etc</li>
                  <li>* - Maybe change the usage of $http</li>
                  <li>Injected Spaces stuff - redirect if in non default space</li>
                </ul>
              </div>
              {null && <Callout callout={callout} onClose={() => this.handleTriggerCallout(null)} />}
              {this.renderFlyout()}
              <EuiTitle size="m">
                <h2 id="tenantLabel" style={{ textAlign: 'center' }}>
                  {currentTenantLabel}
                </h2>
              </EuiTitle>

              <EuiSpacer size="l"/>

              {errorMessage && (
                <>
                  <EuiCallOut title={mtConfigErrorHeader} color="danger" iconType="alert">
                    <p>
                      {errorMessage}
                    </p>
                  </EuiCallOut>

                  <EuiSpacer size="l"/>
                </>
              )}


              <EuiInMemoryTable
                items={uiTenants}
                rowProps={(uiTenant) => {
                  return {
                    isSelected: (uiTenant.id === currentTenant)
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

//Main.contextType = Context;
