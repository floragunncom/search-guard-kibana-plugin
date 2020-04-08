/**
 *    Copyright 2020 floragunn GmbH

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

export class ChromeHelper {
  constructor() {
    this.chrome = null;
    /**
     * Holds the original state of the navigation links "hidden" property
     * Helper for the readOnly functionality
     * @type {null|Object}
     */
    this.changedVisibility = {};
  }

  start(chrome) {
    this.chrome = chrome;
  }

  getNavLinks() {
    return this.chrome.navLinks.getAll();
  }

  getNavLinkById(id) {
    return this.chrome.navLinks.get(id);
  }

  hideNavLink(id, isHidden, skipTracking = false) {
    // This is a bit of a hack to make sure that we detect
    // changes that happen between reading the original
    // state and resolving our info in the readOnly feature
    if (skipTracking === false) {
      this.changedVisibility[id] = isHidden;
    }

    this.updateNavLinkProperty(id, 'hidden', isHidden);
  }

  /**
   * Update a nav link property.
   * Starting from / as of 7.2, only the following attributes
   * can be updated:
   * active, disabled, hidden, url and subUrlBase
   * @param id
   * @param property
   * @param value
   */
  updateNavLinkProperty(id, property, value) {
    this.chrome.navLinks.update(id, {
      [property]: value,
    });
  }

  /**
   * With 7.2, it seems like the way the lastSubUrl is handled changed
   *
   * If the requested id is enabled, the link to the last subUrl is reset.
   * @param id
   */
  resetLastUrl(id) {
    const navLink = this.getNavLinkById(id);
    if (!navLink) {
      return;
    }

    this.updateNavLinkProperty(id, 'url', navLink.baseUrl);
  }
}