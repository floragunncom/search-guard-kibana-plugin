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

import React, { useContext, useState, useEffect } from 'react';
import { EuiHealth, EuiHighlight } from '@elastic/eui';
import { ElasticsearchService } from '../../../services';
import { indicesToUiIndices } from './role_to_formik';
import { comboBoxOptionsToArray } from '../../../utils/helpers';

import { Context } from '../../../Context';

export function useIndexPatterns() {
  const { httpClient, addErrorToast } = useContext(Context);
  const [isLoading, setIsLoading] = useState(false);
  const [indexOptions, setIndexOptions] = useState([]);
  const [dataStreamOptions, setDataStreamOptions] = useState([]);

  const esService = new ElasticsearchService(httpClient);

  async function onSearchChange(query = '') {
    setIsLoading(true);

    try {
      if (!query.endsWith('*')) query += '*';

      query = query.trim();
      if (query === '*:' || query === '') return [];

      const [{ data: indices = [] }, { data: aliases = [] }, { data: dataStreams = [] }] = await Promise.all([
        esService.getIndices(query),
        esService.getAliases(query),
        esService.getDataStreams(query),
      ]);

      setIndexOptions(indicesToUiIndices([...indices, ...aliases]));
      setDataStreamOptions(indicesToUiIndices([...dataStreams.data_streams]));
    } catch (error) {
      console.error('IndexPatterns - onSearchChange', error);
      addErrorToast(error);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    onSearchChange('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isLoading,
    setIsLoading,
    indexOptions,
    dataStreamOptions,
    onSearchChange,
  };
}

export const indexPatternNames = (indexPatterns = []) =>
  comboBoxOptionsToArray(indexPatterns).join(', ');

export function renderIndexOption({ color, label }, searchValue, contentClassName) {
  return (
    <EuiHealth color={color}>
      <span className={contentClassName}>
        <EuiHighlight search={searchValue}>{label}</EuiHighlight>
      </span>
    </EuiHealth>
  );
}
