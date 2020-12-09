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

import { useEffect, useState, useContext } from 'react';
import { Context } from '../../../Context';

export function useResourcesTable({ Service, resourcesToUiResources, onTriggerErrorCallout }) {
  const { httpClient } = useContext(Context);
  const service = new Service(httpClient);

  const [tableResources, setTableResources] = useState([]);
  const [tableError, setTableError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTableResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchTableResources() {
    setIsLoading(true);

    try {
      setTableResources(resourcesToUiResources(await service.list()));
    } catch (error) {
      console.error('useResourcesTable, error', error);
      onTriggerErrorCallout(error);
      setTableError(error);
    }

    setIsLoading(false);
  }

  return { tableResources, tableError, isLoading };
}
