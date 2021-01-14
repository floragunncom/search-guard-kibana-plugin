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
import { get } from 'lodash';
import { Context } from '../Context';

export function useResourcesTable({ Service, resourcesToUiResourcesFn }) {
  const { httpClient, triggerErrorCallout, triggerConfirmDeletionModal } = useContext(Context);
  const service = new Service(httpClient);

  const [tableResources, setTableResources] = useState([]);
  const [tableResourcesSelection, setTableResourcesSelection] = useState([]);
  const [tableError, setTableError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTableResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchTableResources() {
    setIsLoading(true);

    try {
      let resources = await service.list();

      if (typeof resourcesToUiResourcesFn === 'function') {
        resources = resourcesToUiResourcesFn(resources);
      }

      console.debug('useResourcesTable, fetchTableResources, resources', resources);
      setTableResources(resources);
    } catch (error) {
      console.error('useResourcesTable, fetchTableResources', error);
      triggerErrorCallout(error);
      setTableError(error);
    }

    setIsLoading(false);
  }

  async function deleteTableResources(ids = []) {
    triggerConfirmDeletionModal({
      body: ids.join(', '),
      onConfirm: () => {
        deleteResources(ids);
        setTableResourcesSelection([]);
        triggerConfirmDeletionModal(null);
      },
      onCancel: () => {
        setTableResourcesSelection([]);
        triggerConfirmDeletionModal(null);
      },
    });

    async function deleteResources(ids) {
      setIsLoading(true);

      try {
        const resp = await Promise.all(ids.map(service.delete));
        console.debug('useResourcesTable, deleteResources, resp', resp);
      } catch (error) {
        console.error('useResourcesTable, deleteTableResources', error);
        triggerErrorCallout(error);
      }

      setIsLoading(false);
      fetchTableResources();
    }
  }

  return {
    service,
    tableResources,
    tableResourcesSelection,
    isLoading,
    tableError: get(tableError, 'message', tableError),
    setTableResourcesSelection,
    deleteTableResources,
  };
}
