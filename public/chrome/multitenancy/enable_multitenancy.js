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

export function toggleNavLink(Private) {
    var enabled = chrome.getInjected('multitenancy_enabled');
    chrome.getNavLinkById("searchguard-multitenancy").hidden = !enabled;
  if (enabled) {
      FeatureCatalogueRegistryProvider.register(() => {
          return {
              id: 'searchguard-multitenancy',
              title: 'Search Guard Multi Tenancy',
              description: 'Separate searches, visualizations and dashboards by tenants.',
              icon: '/plugins/searchguard/assets/multitenancy_app.svg',
              path: '/app/searchguard-multitenancy',
              showOnHomePage: true,
              category: FeatureCatalogueCategory.DATA
          };
      });
  }

}

uiModules.get('searchguard').run(toggleNavLink);

