/*
 *    Copyright 2021 floragunn GmbH
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

import React, { useState, useEffect, useContext } from 'react';
import {
  EuiButton,
  EuiHeaderSectionItemButton,
  EuiPopover,
  EuiPopoverFooter,
  EuiPopoverTitle,
  EuiSelectable,
  EuiCallOut,
  EuiErrorBoundary,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import { htmlIdGenerator } from '@elastic/eui/lib/services';
import { API_ROOT } from '../../utils/constants';
import { MainContext } from './contexts/MainContextProvider';
import {
  UI_GLOBAL_TENANT_NAME,
  UI_PRIVATE_TENANT_NAME,
  tenantNameToUiTenantName,
  uiTenantNameToTenantName,
} from '../../../common/multitenancy';
import {
  yourTenantsText,
  addMoreTenantsText,
  readText,
  readWriteText,
  noTenantOrIndexText,
  selectedText,
} from './utils/i18n';

export function getPersistentColorFromText(text = '') {
  const dict = 'D12CFA8735B6E049';
  const color = ['#'];

  for (let i = 0; i < 6; i++) {
    if (!text || !text[i]) {
      color.push('0');
    } else {
      color.push(dict[text[i].charCodeAt() % dict.length]);
    }
  }

  return color.join('');
}

export function TenantAvatar({ name, style = {} } = {}) {
  let initials = name;
  if (typeof initials === 'string' && initials.length >= 2) {
    initials = initials[0].toUpperCase() + initials[1];
  }

  const color = getPersistentColorFromText(name);
  const defaultStyle = {
    border: '2px solid',
    backgroundColor: '#FFFFFF',
    borderColor: color,
    color: '#000000',
    width: '24px',
    height: '24px',
    lineHeight: '24px',
    fontSize: '12px',
    position: 'relative',
    borderRadius: '4px',
    flexShrink: 0,
    display: 'inline-block',
    backgroundSize: 'cover',
    verticalAlign: 'middle',
    textAlign: 'center',
    fontWeight: 500,
  };

  return (
    <div aria-label={name} title={name} style={{ ...defaultStyle, ...style }}>
      <p>{initials}</p>
    </div>
  );
}

export function tenantsToUiTenants({
  currentTenant,
  tenantinfo = {},
  authinfo = {},
  globalTenantEnabled,
  privateTenantEnabled,
  isDashboardOnlyRole,
} = {}) {
  const userName = authinfo.user_name;
  const tenants = { ...authinfo.sg_tenants };

  const tenantToIndexMap = new Map();
  for (const [tenantIndex, tenantName] of Object.entries(tenantinfo)) {
    tenantToIndexMap.set(tenantName, tenantIndex);
  }

  // If SGS_GLOBAL_TENANT is not available in tenant list, it needs to be
  // removed from UI display as well
  let globalUserWriteable = false;
  let globalUserVisible = false;
  delete tenants[userName];

  // delete the SGS_GLOBAL_TENANT for the moment. We fall back the GLOBAL until
  // RBAC is rolled out completely.
  if (tenants.hasOwnProperty('SGS_GLOBAL_TENANT') && globalTenantEnabled) {
    globalUserWriteable = tenants.SGS_GLOBAL_TENANT && !isDashboardOnlyRole;
    globalUserVisible = true;
  }
  delete tenants.SGS_GLOBAL_TENANT;

  function creteDataTestSubj(tenantName) {
    return 'sg.tenantsMenu.tenant.' + tenantName.toLowerCase();
  }

  const uiTenants = Object.entries(tenants)
    .reduce((acc, [tenantName]) => {
      const canWrite = !isDashboardOnlyRole && tenants[tenantName];
      const disabled = !tenantToIndexMap.has(tenantName) && !canWrite;
      const checked = tenantName === currentTenant ? 'on' : undefined;

      let append = canWrite ? readWriteText : readText;
      if (disabled) {
        append = noTenantOrIndexText;
      }

      acc.push({
        'aria-label': tenantName,
        searchableLabel: tenantName,
        label: tenantName,
        checked,
        disabled,
        prepend: <TenantAvatar name={tenantName} />,
        append,
        'data-test-subj': creteDataTestSubj(tenantName),
      });
      return acc;
    }, [])
    .sort((a, b) => a.label[0] - b.label[0]);

  if (privateTenantEnabled && !isDashboardOnlyRole) {
    uiTenants.unshift({
      'aria-label': UI_PRIVATE_TENANT_NAME,
      searchableLabel: UI_PRIVATE_TENANT_NAME,
      label: UI_PRIVATE_TENANT_NAME,
      checked: currentTenant === UI_PRIVATE_TENANT_NAME ? 'on' : undefined,
      disabled: false,
      prepend: <TenantAvatar name={UI_PRIVATE_TENANT_NAME} />,
      append: readWriteText,
      'data-test-subj': creteDataTestSubj(UI_PRIVATE_TENANT_NAME),
    });
  }

  // @todo Why is this called globalUserVisible and not globalTenantVisible?
  if (globalUserVisible) {
    uiTenants.unshift({
      'aria-label': UI_GLOBAL_TENANT_NAME,
      searchableLabel: UI_GLOBAL_TENANT_NAME,
      label: UI_GLOBAL_TENANT_NAME,
      checked: currentTenant === UI_GLOBAL_TENANT_NAME ? 'on' : undefined,
      disabled: false,
      prepend: <TenantAvatar name={UI_GLOBAL_TENANT_NAME} />,
      append: globalUserWriteable ? readWriteText : readText,
      'data-test-subj': creteDataTestSubj(UI_GLOBAL_TENANT_NAME),
    });
  }

  // We need to put this dummy option as the first option because if we don't do it
  // and the EuiSelectable scroll is present (it is present if there are more than 7 options),
  // the first option is checked only after the second click.
  uiTenants.unshift({ label: 'Tenants', isGroupLabel: true });

  return uiTenants;
}

export function hasUserDashboardOnlyRole({ readOnlyConfig = {}, authinfo = {} } = {}) {
  try {
    return authinfo.sg_roles.filter((role) => {
      return readOnlyConfig.roles.indexOf(role) > -1;
    }).length
      ? true
      : false;
  } catch (error) {
    // Ignore for now
    console.error('hasUserDashboardOnlyRole, could not check read only mode roles', error);
  }

  return false;
}

function ConfigurationCheckCallOut() {
  const { httpClient, configService, addErrorToast } = useContext(MainContext);
  const [error, setError] = useState(null);

  const kibanaServerUser = configService.get('opensearch.username');
  const kibanaIndex = configService.get('opensearchDashboards.index');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    try {
      const { data: mtInfo } = await httpClient.get(`${API_ROOT}/multitenancy/info`);
      let errorMessage = null;

      if (!mtInfo.kibana_mt_enabled) {
        errorMessage =
          'Either the Multitenancy module is not present on Elasticsearch Search Guard, or it is disabled.';
      }

      if (mtInfo.kibana_server_user !== kibanaServerUser) {
        errorMessage =
          'Mismatch between the configured Kibana server usernames on OpenSearch and Dashboards, multitenancy will not work! ' +
          'Configured username on Dashboards: "' +
          kibanaServerUser +
          '", configured username on OpenSearch: "' +
          mtInfo.kibana_server_user +
          '"';
      }

      if (mtInfo.kibana_index !== kibanaIndex) {
        errorMessage =
          'Mismatch between the configured Kibana index names on OpenSearch and Dashboards, multitenancy will not work! ' +
          'Configured index name on Dashboards: "' +
          kibanaIndex +
          '", configured index name on OpenSearch: "' +
          mtInfo.kibana_index +
          '"';
      }

      if (errorMessage) setError(errorMessage);
    } catch (error) {
      console.error('ConfigurationCheckCallout, fetchData', error);
      setError(null);
      addErrorToast(error);
    }
  }

  if (!error) return null;

  return (
    <div style={{ padding: 10 }}>
      <EuiCallOut title={error} color="danger" iconType="alert" />
    </div>
  );
}

export function SelectedTenant({ selectedTenant }) {
  if (!selectedTenant || !selectedTenant.label) return null;

  let tenantName = selectedTenant.label;
  if (tenantName.length > 30) {
    tenantName = tenantName.slice(0, 30) + '...';
  }

  return (
    <div style={{ paddingTop: 10, textAlign: 'center' }}>
      <EuiToolTip content={selectedTenant.label}>
        <EuiText grow={false}>
          <p id="sg.tenantsMenu.selectedTenant">
            {selectedText}: {tenantName}
          </p>
        </EuiText>
      </EuiToolTip>
    </div>
  );
}

export function TenantsMenu() {
  const { httpClient, configService, chromeHelper, kibanaApplication, addErrorToast } = useContext(
    MainContext
  );

  const {
    enable_global: globalTenantEnabled,
    enable_private: privateTenantEnabled,
  } = configService.get('searchguard.multitenancy.tenants');
  const readOnlyConfig = configService.get('searchguard.readonly_mode');
  const isSGConfigEnabled =
    configService.get('searchguard.configuration.enabled') && configService.hasApiAccess();
  const id = htmlIdGenerator()();

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(findSelectedTenant(tenants));

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    setIsLoading(true);

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

      const uiTenants = tenantsToUiTenants({
        tenantinfo,
        globalTenantEnabled,
        privateTenantEnabled,
        authinfo,
        currentTenant: tenantNameToUiTenantName(currentTenant),
        isDashboardOnlyRole: hasUserDashboardOnlyRole({ authinfo, readOnlyConfig }),
      });
      console.debug('TenantsMenu, fetchData, uiTenants', uiTenants);

      setTenants(uiTenants);

      setSelectedTenant(findSelectedTenant(uiTenants));
    } catch (error) {
      console.error('TenantsMenu, fetchData', error);
      addErrorToast(error);
    }

    setIsLoading(false);
  }

  async function applyTenant(tenant) {
    setIsLoading(true);

    try {
      const tenantName = uiTenantNameToTenantName(tenant.searchableLabel);
      const { data: newTenant } = await httpClient.post(`${API_ROOT}/multitenancy/tenant`, {
        username: configService.get('authinfo.user_name'),
        tenant: tenantName,
      });
      console.debug('TenantsMenu, applyTenant, newTenant', newTenant);

      // Clear lastUrls from nav links to avoid not found errors.
      // Make sure that the app is really enabled before accessing.
      // If chromeWrapper.resetLastSubUrl is used, the check for enabled apps is redundant.
      // Keeping this to make the merges a bit easier.
      const appsToReset = ['visualize', 'dashboards', 'discover', 'timelion'];
      chromeHelper.getNavLinks().forEach((navLink) => {
        if (appsToReset.indexOf(navLink.id) > -1) {
          chromeHelper.resetLastUrl(navLink.id);
        }
      });

      // Clear last urls, but leave our own items untouched. Take safe mutation approach.
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

      // We may need to redirect the user if they are in
      // a non default space before switching tenants
      const pathWithoutSpace =
        httpClient.basePath.serverBasePath + httpClient.basePath.remove(window.location.pathname);

      // Always reload after switching tenants manually.
      // Otherwise we may see weird issues with default index patterns and spaces.
      window.location.href = pathWithoutSpace;
    } catch (error) {
      console.error('TenantsMenu, applyTenant', error);
      addErrorToast(error);
    }

    setIsLoading(false);
  }

  function findSelectedTenant(tenants) {
    return tenants.filter((t) => t.checked === 'on')[0];
  }

  function onMenuButtonClick() {
    setIsOpen(!isOpen);
    fetchData();
  }

  function closePopover() {
    setIsOpen(false);
  }

  function onChange(tenants) {
    const tenant = findSelectedTenant(tenants);

    setTenants(tenants);
    setSelectedTenant(tenant);
    setIsOpen(false);
    applyTenant(tenant);
  }

  function addMoreTenants() {
    kibanaApplication.navigateToUrl(
      `${httpClient.http.basePath.basePath}/app/searchguard-configuration#/tenants`
    );
  }

  if (!selectedTenant) return null;

  return (
    <EuiPopover
      id={id}
      button={
        <EuiHeaderSectionItemButton
          aria-controls={id}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={selectedTenant.searchableLabel}
          title={selectedTenant.searchableLabel}
          data-test-subj="sg.tenantsMenu.popover.button"
          onClick={onMenuButtonClick}
        >
          {selectedTenant.prepend}
        </EuiHeaderSectionItemButton>
      }
      isOpen={isOpen}
      anchorPosition="downLeft"
      closePopover={closePopover}
      panelPaddingSize="none"
      data-test-subj="sg.tenantsMenu.popover"
    >
      <EuiSelectable
        isLoading={isLoading}
        searchable={true}
        searchProps={{
          placeholder: 'Find a tenant',
          compressed: true,
          'data-test-subj': 'sg.tenantsMenu.selectable.search',
        }}
        options={tenants}
        singleSelection="always"
        style={{ width: 400 }}
        onChange={onChange}
        listProps={{
          rowHeight: 40,
          showIcons: false,
        }}
        data-test-subj="sg.tenantsMenu.selectable"
      >
        {(list, search) => {
          return (
            <EuiErrorBoundary>
              <ConfigurationCheckCallOut />
              <SelectedTenant selectedTenant={selectedTenant} />
              <EuiPopoverTitle paddingSize="s">{search || yourTenantsText}</EuiPopoverTitle>
              {list}
              <EuiPopoverFooter paddingSize="s">
                {isSGConfigEnabled && (
                  <EuiButton
                    size="s"
                    fullWidth
                    onClick={addMoreTenants}
                    data-test-subj="sg.tenantsMenu.selectable.addMoreTenants"
                  >
                    {addMoreTenantsText}
                  </EuiButton>
                )}
              </EuiPopoverFooter>
            </EuiErrorBoundary>
          );
        }}
      </EuiSelectable>
    </EuiPopover>
  );
}
