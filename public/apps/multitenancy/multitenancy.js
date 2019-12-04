/**
 *    Copyright 2016 floragunn GmbH

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import { toastNotifications } from 'ui/notify';
import chrome from 'ui/chrome';
import uiRoutes from 'ui/routes';
import { uiModules } from 'ui/modules';
import 'ui/autoload/styles';
import { IndexPatternsGetProvider } from 'ui/index_patterns/_get';

import 'plugins/searchguard/apps/configuration/configuration.less';

import '../../directives/licensewarning';

import tenantTemplate from './multitenancy.html';

import { chromeWrapper} from "../../services/chrome_wrapper";

uiRoutes.enable();

uiRoutes
    .when('/', {
        template: tenantTemplate,
        controller: 'searchguardMultitenancyController',
        controllerAs: 'ctrl'
    });

uiModules
    .get('app/searchguard-multitenancy')
    .controller('searchguardMultitenancyController', function ($http, $window, Private, sg_resolvedInfo) {
        const indexPatternsGetProvider = Private(IndexPatternsGetProvider)('id');

        var APP_ROOT = `${chrome.getBasePath()}`;
        var API_ROOT = `${APP_ROOT}/api/v1`;

        /**
         * Is the user in a read only mode - either because of a dashboard only role,
         * or because the current tenant is read only
         * @type {boolean}
         */
        let isReadOnly = false;

        const kibana_server_user = chrome.getInjected("kibana_server_user");
        const kibana_index = chrome.getInjected("kibana_index");

        /**
         * If the user is in read only mode because of a given dashboard only role
         * @type {boolean}
         */
        this.userHasDashboardOnlyRole = false;

        if (sg_resolvedInfo) {
            isReadOnly = (sg_resolvedInfo.isReadOnly === true)
            this.userHasDashboardOnlyRole = (isReadOnly && sg_resolvedInfo.hasDashboardRole === true);
        }

        this.privateEnabled = chrome.getInjected("multitenancy.tenants.enable_private");

        // Don't show the private tenant if the user is a dashboard only user.
        if (this.privateEnabled && this.userHasDashboardOnlyRole) {
            this.privateEnabled = false;
        }

        this.globalEnabled = chrome.getInjected("multitenancy.tenants.enable_global");
        this.showfilter = chrome.getInjected("multitenancy.enable_filter");
        this.showroles = chrome.getInjected("multitenancy.show_roles");

        this.GLOBAL_USER_LABEL = "Global";
        this.GLOBAL_USER_VALUE = "";
        this.GLOBAL_USER_VISIBLE = true;
        this.GLOBAL_USER_WRITEABLE = true;
        this.PRIVATE_USER_LABEL = "Private";
        this.PRIVATE_USER_VALUE = "__user__";
        this.currentTenant = null;
        this.tenantSearch = "";
        this.roles = "";
        this.rolesArray = {};
        this.showSubmenu = false;

        $http.get(`${API_ROOT}/multitenancy/info`)
            .then(
            (response) => {
                // sanity checks, check that configuration is correct on
                // both ES and KI side
                var mtinfo = response.data;

                // this.GLOBAL_USER_WRITEABLE = (!mtinfo.kibana_index_readonly && ! this.userHasDashboardOnlyRole);

                if(!mtinfo.kibana_mt_enabled) {
                    this.errorMessage = "It seems that the Multitenancy module is not installed on your Elasticsearch cluster, or it is disabled. Multitenancy will not work, please check your installation.";
                    return;
                }

                if(mtinfo.kibana_server_user != kibana_server_user) {
                    this.errorMessage = "Mismatch between the configured Kibana server usernames on Elasticsearch and Kibana, multitenancy will not work! " +
                        "Configured username on Kibana: '"+kibana_server_user+"', configured username on Elasticsearch: '"+mtinfo.kibana_server_user+"'";
                    return;
                }

                if(mtinfo.kibana_index != kibana_index) {
                    this.errorMessage = "Mismatch between the configured Kibana index names on Elasticsearch and Kibana, multitenancy will not work! " +
                        "Configured index name on Kibana: '"+kibana_index+"', configured index name on Elasticsearch: '"+mtinfo.kibana_index+"'";
                    return;
                }
            },
            (error) =>
            {
                toastNotifications.addDanger({
                    title: 'Unable to load multitenancy info.',
                    text: error.data.message,
                });
            }
        );

        $http.get(`${API_ROOT}/auth/authinfo`)
            .then(
            (response) => {
                // remove users own tenant, will be replaced with __user__
                // since we want to display tenant name with "Private"
                this.username = response.data.user_name;
                var allTenants = response.data.sg_tenants;
                delete allTenants[this.username];

                // delete the SGS_GLOBAL_TENANT for the moment. We fall back the GLOBAL until
                // RBAC is rolled out completely.
                if(response.data.sg_tenants.hasOwnProperty("SGS_GLOBAL_TENANT") && this.globalEnabled) {
                    this.GLOBAL_USER_WRITEABLE = response.data.sg_tenants.SGS_GLOBAL_TENANT && !this.userHasDashboardOnlyRole;
                    this.GLOBAL_USER_VISIBLE = true;
                } else {
                    // SGS_GLOBAL_TENANT not available in tenant list, needs to be
                    // removed from UI display as well
                    this.GLOBAL_USER_WRITEABLE = false;
                    this.GLOBAL_USER_VISIBLE = false;
                }
                delete response.data.sg_tenants["SGS_GLOBAL_TENANT"];

                // sort tenants by putting the keys in an array first
                var tenantkeys = [];
                var k;

                for (k in allTenants) {
                    if (allTenants.hasOwnProperty(k)) {
                        tenantkeys.push(k);
                    }
                }
                tenantkeys.sort();

                this.tenants = allTenants;
                this.tenantkeys = tenantkeys;
                this.roles = response.data.sg_roles.join(", ");
                this.rolesArray = response.data.sg_roles;

                $http.get(`${API_ROOT}/multitenancy/tenant`)
                    .then(
                    (response) => {
                        this.currentTenant = response.data;
                        this.tenantLabel = "Active tenant: " + resolveTenantName(this.currentTenant, this.username);
                    },
                    (error) => {
                        toastNotifications.addDanger({
                            text: error.data.message,
                        });
                    }
                );
            },
            (error) =>
            {
                toastNotifications.addDanger({
                    title: 'Unable to load authentication info.',
                    text: error.data.message,
                });
            }
        );

        this.selectTenant = function (tenantLabel, tenant, redirect) {
            $http.post(`${API_ROOT}/multitenancy/tenant`, {tenant: tenant, username: this.username})
                .then(
                (response) => {
                    this.tenantLabel = "Active tenant: " + resolveTenantName(response.data, this.username);
                    this.currentTenant = response.data;

                    // clear lastUrls from nav links to avoid not found errors.
                    // Make sure that the app is really enabled before accessing.
                    // If chromeWrapper.resetLastSubUrl is used, the check for enabled apps is redundant.
                    // Keeping this to make the merges a bit easier.
                    const appsToReset = ['kibana:visualize', 'kibana:dashboard', 'kibana:discover', 'timelion'];
                    chromeWrapper.getNavLinks().forEach((navLink) => {
                        if (appsToReset.indexOf(navLink.id) > -1) {
                            chromeWrapper.resetLastSubUrl(navLink.id);
                        }
                    });

                    // clear last sub urls, but leave our own items untouched. Take safe mutation approach.
                    var lastSubUrls = [];
                    for (var i = 0; i < sessionStorage.length; i++) {
                        var key = sessionStorage.key(i);
                        if (key.startsWith("lastSubUrl")) {
                            lastSubUrls.push(key);
                        }
                    }
                    for (var i = 0; i < lastSubUrls.length; i++) {
                        sessionStorage.removeItem(lastSubUrls[i]);
                    }
                    // to be on the safe side for future changes, clear localStorage as well
                    localStorage.clear();

                    // redirect to either Visualize or Dashboard depending on user selection.
                    if(redirect) {
                        if (redirect == 'vis') {
                            $window.location.href = chromeWrapper.getNavLinkById("kibana:visualize").url;
                        }
                        if (redirect == 'dash') {
                            $window.location.href = chromeWrapper.getNavLinkById("kibana:dashboard").url;
                        }
                    } else {
                        toastNotifications.addSuccess({
                            title: 'Tenant changed',
                            text: "Selected tenant is now " + resolveTenantName(response.data, this.username),
                        });

                        // We may need to redirect the user if they are in a non default space
                        // before switching tenants
                        try {
                            const injected = chrome.getInjected();
                            if (injected.spacesEnabled && injected.activeSpace && injected.activeSpace.id !== 'default') {
                                $window.location.href = "/app/searchguard-multitenancy";
                            }
                        } catch(error) {
                            // Ignore
                        }
                    }
                },
                (error) =>
                {
                    toastNotifications.addDanger({
                        text: error.data.message
                    });
                }
            );
        };

        function resolveTenantName(tenant, username) {
            if (!tenant || tenant == "undefined") {
                return "Global";
            }
            if (tenant == username || tenant == '__user__') {
                return "Private";
            } else {
                return tenant;
            }
        }

    });
