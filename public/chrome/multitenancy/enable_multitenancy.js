/**
 *    Copyright 2017 floragunn GmbH

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


import chrome from 'ui/chrome';
import { uiModules } from 'ui/modules';
import { FeatureCatalogueRegistryProvider, FeatureCatalogueCategory } from 'ui/registry/feature_catalogue';
import { EuiIcon } from '@elastic/eui';
import {parse} from "url";
import {addResponseInterceptor} from "../../services/fetch_wrapper";

export function enableMultiTenancy(Private, multitenancyState) {
    const sgDynamic = chrome.getInjected().sgDynamic;
    var enabled = chrome.getInjected('multitenancy_enabled');
    chrome.getNavLinkById("searchguard-multitenancy").hidden = !enabled;
    if (enabled) {
      FeatureCatalogueRegistryProvider.register(() => {
          return {
              id: 'searchguard-multitenancy',
              title: 'Search Guard Multi Tenancy',
              description: 'Separate searches, visualizations and dashboards by tenants.',
              icon: 'usersRolesApp',
              path: '/app/searchguard-multitenancy',
              showOnHomePage: true,
              category: FeatureCatalogueCategory.DATA
          };
      });

      addTenantResponseInterceptor(multitenancyState);
    }

    // Add tenant info to the request
    if (sgDynamic && sgDynamic.multiTenancy) {
        // Add the tenant to URLs copied from the share panel
        document.addEventListener('copy', (event) => {
            const shareButton = document.querySelector('[data-share-url]');
            const target = document.querySelector('body > span');
            // The copy event listens to Cmd + C too, so we need to make sure
            // that we're actually copied something via the share panel
            if (shareButton && target && shareButton.getAttribute('data-share-url') == target.textContent) {
                let originalValue = target.textContent;
                let urlPart = originalValue;

                // We need to figure out where in the value to add the tenant.
                // Since Kibana sometimes adds values that aren't in the current location/url,
                // we need to use the actual input values to do a sanity check.
                try {

                    // For the iFrame urls we need to parse out the src
                    if (originalValue.toLowerCase().indexOf('<iframe') === 0) {
                        const regex = /<iframe[^>]*src="([^"]*)"/i;
                        let match = regex.exec(originalValue);
                        if (match) {
                            urlPart = match[1]; // Contains the matched src, [0] contains the string where the match was found
                        }
                    }

                    let newValue = addTenantToURL(urlPart, originalValue, sgDynamic.multiTenancy.currentTenantName);

                    if (newValue !== originalValue) {
                        target.textContent = newValue;
                    }
                } catch (error) {
                    // Probably wasn't an url, so we just ignore this
                }
            }
        });
    }
}



/**
 * Add the tenant the value. The originalValue may include more than just an URL, e.g. for iFrame embeds.
 * @param url - The url we will append the tenant to
 * @param originalValue - In the case of iFrame embeds, we can't just replace the url itself
 * @returns {*}
 */
function addTenantToURL(url, originalValue = null, userRequestedTenant) {
    const tenantKey = 'sg_tenant';
    const tenantKeyAndValue = tenantKey + '=' + encodeURIComponent(userRequestedTenant);

    if (! originalValue) {
        originalValue = url;
    }

    let {host, pathname, search} = parse(url);
    let queryDelimiter = (!search) ? '?' : '&';

    // The url parser returns null if the search is empty. Change that to an empty
    // string so that we can use it to build the values later
    if (search === null) {
        search = '';
    } else if (search.toLowerCase().indexOf(tenantKey) > - 1) {
        // If we for some reason already have a tenant in the URL we skip any updates
        return originalValue;
    }

    // A helper for finding the part in the string that we want to extend/replace
    let valueToReplace = host + pathname + search;
    let replaceWith = valueToReplace + queryDelimiter + tenantKeyAndValue;

    return originalValue.replace(valueToReplace, replaceWith);
}

/**
 * Adds an interceptor for fetch calls
 * @param multitenancyState
 */
function addTenantResponseInterceptor(multitenancyState) {
  addResponseInterceptor((response) => {
    const backendTenant = response.headers.get('sgtenant');
    compareTenants(multitenancyState, backendTenant);

    return response;
  })
}

function compareTenants(multitenancyState, backendTenant) {
  // If we don't have a tenant set, we can just return
  if (backendTenant === null || multitenancyState.currentTenant === null) {
    return;
  }

  // Reload the page if we detect a tenant mismatch
  if (backendTenant !== multitenancyState.currentTenant) {
    const reloadParameter = "tenantMismatch=true";
    let locationSearch = location.search;
    // Make sure that we only redirect once, just in case something unforeseen happens
    if (locationSearch.indexOf(reloadParameter) > -1) {
      return;
    }

    if(!locationSearch) {
      locationSearch = `?${reloadParameter}`;
    } else {
      locationSearch = `${locationSearch}&${reloadParameter}`;
    }

    window.location.search = locationSearch;

    // We need to throw an error to make sure subsequent ajax calls are prevented
    throw new Error('Tenant mismatch, the page should be reloaded');
  }
}

const app = uiModules.get('searchguard')
  .service('multitenancyState', function() {
    const injected = chrome.getInjected();
    this.currentTenant = null;
    if (injected.sgDynamic && injected.sgDynamic.multiTenancy && typeof injected.sgDynamic.multiTenancy.currentTenant !== 'undefined') {
      this.currentTenant = injected.sgDynamic.multiTenancy.currentTenant;
    }
  })

// If multitenancy is enabled, check for a tenant mismatch between the browser and the backend
if (chrome.getInjected('multitenancy_enabled')) {
  app.factory('tenantMismatchInterceptor', function (multitenancyState) {
      return {
        response: function (response) {
          const backendTenant = response.headers('sgtenant');
          compareTenants(multitenancyState, backendTenant);

          return response;
        }
      };
  })
  .config(function($httpProvider) {
      $httpProvider.interceptors.push('tenantMismatchInterceptor');
  });
}

app.run(enableMultiTenancy);

