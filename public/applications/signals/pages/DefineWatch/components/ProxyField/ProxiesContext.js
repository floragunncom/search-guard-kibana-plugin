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

export const ProxiesContext = React.createContext([]);

// Loads the stored Signals proxies once per watch page for all proxy fields (actions and checks).
// Listing them is optional: without the proxies/findall permission the fields only offer the keywords
// and typed values, so a failure is only logged.
export const ProxiesProvider = ({ httpClient, children }) => {
  const [proxies, setProxies] = useState([]);

  useEffect(() => {
    let isMounted = true;
    new ProxiesService(httpClient)
      .list()
      .then(({ resp }) => {
        if (isMounted) setProxies(resp);
      })
      .catch((error) => {
        console.warn('ProxiesProvider -- list', error);
      });
    return () => {
      isMounted = false;
    };
  }, [httpClient]);

  return <ProxiesContext.Provider value={proxies}>{children}</ProxiesContext.Provider>;
};

ProxiesProvider.propTypes = {
  httpClient: PropTypes.object.isRequired,
  children: PropTypes.node,
};
