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

import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { EuiInMemoryTable, EuiEmptyPrompt } from '@elastic/eui';
import { ContentPanel, CancelButton, TableTextCell } from '../../components';
import { BlocksService } from '../../services';
import { nameText, descriptionText } from '../../utils/i18n/common';
import {
  blocksText,
  typeText,
  valueText,
  verdictText,
  noBlocksText,
  blocksDescriptionContentPanelText,
} from '../../utils/i18n/blocks';
import { APP_PATH } from '../../utils/constants';
import { resourcesToUiResources } from './utils';
import { useResourcesTable } from '../utils/hooks';

export function Blocks({ history, onTriggerErrorCallout }) {
  const { tableResources, tableError, isLoading } = useResourcesTable({
    Service: BlocksService,
    resourcesToUiResources,
    onTriggerErrorCallout,
  });

  const columns = [
    {
      field: '_id',
      name: nameText,
      footer: nameText,
      align: 'left',
      sortable: true,
      mobileOptions: {
        header: false,
      },
      render: (v) => <TableTextCell name={`Name-${v}`} value={v} />,
    },
    {
      field: 'description',
      name: descriptionText,
      footer: descriptionText,
      align: 'left',
      sortable: true,
      mobileOptions: {
        header: false,
      },
      render: (v) => <TableTextCell name={`Description-${v}`} value={v} />,
    },
    {
      field: 'type',
      name: typeText,
      footer: typeText,
      align: 'left',
      sortable: true,
      mobileOptions: {
        header: false,
      },
      render: (v) => <TableTextCell name={`Type-${v}`} value={v} />,
    },
    {
      field: 'value',
      name: valueText,
      footer: valueText,
      align: 'left',
      sortable: true,
      mobileOptions: {
        header: false,
      },
      render: (v) => <TableTextCell name={`Value-${v}`} value={v} />,
    },
    {
      field: 'verdict',
      name: verdictText,
      footer: verdictText,
      align: 'left',
      sortable: true,
      mobileOptions: {
        header: false,
      },
      render: (v) => <TableTextCell name={`Verdict-${v}`} value={v} />,
    },
  ];

  const search = {
    box: {
      incremental: true,
    },
  };

  return (
    <ContentPanel
      title={blocksText}
      description={blocksDescriptionContentPanelText}
      actions={[<CancelButton onClick={() => history.push(APP_PATH.HOME)} />]}
    >
      <EuiInMemoryTable
        items={tableResources}
        itemId="_id"
        error={get(tableError, 'message', tableError)}
        message={<EuiEmptyPrompt title={<h3>{noBlocksText}</h3>} titleSize="xs" />}
        loading={isLoading}
        columns={columns}
        search={search}
        pagination={true}
        sorting={true}
        isSelectable={true}
      />
    </ContentPanel>
  );
}

Blocks.propTypes = {
  history: PropTypes.object.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired,
};
