/*
 *    Copyright 2026 floragunn GmbH
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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ProxiesService } from '../../../../services';

export const ProxiesContext = React.createContext({ proxies: [], isListForbidden: false });

// Loads the stored Signals proxies once per watch page for all proxy fields (one per webhook action).
// Listing them is optional: without the proxies/findall permission the fields only offer the keywords
// and typed values, and say why. Any failure is only logged, never shown as an error.
export const ProxiesProvider = ({ httpClient, children }) => {
  const [value, setValue] = useState({ proxies: [], isListForbidden: false });

  useEffect(() => {
    let isMounted = true;
    new ProxiesService(httpClient)
      .list()
      .then(({ resp }) => {
        if (isMounted) setValue({ proxies: resp, isListForbidden: false });
      })
      .catch((error) => {
        console.warn('ProxiesProvider -- list', error);
        // Kibana's HttpFetchError carries the status of the failed request in body.statusCode.
        if (isMounted && error?.body?.statusCode === 403) {
          setValue({ proxies: [], isListForbidden: true });
        }
      });
    return () => {
      isMounted = false;
    };
  }, [httpClient]);

  return <ProxiesContext.Provider value={value}>{children}</ProxiesContext.Provider>;
};

ProxiesProvider.propTypes = {
  httpClient: PropTypes.object.isRequired,
  children: PropTypes.node,
};
