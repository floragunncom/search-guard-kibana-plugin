/*
 *    Copyright 2025 floragunn GmbH
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

import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiTitle,
  EuiInMemoryTable,
  EuiIcon,
  EuiFieldSearch,
  EuiCallOut,
  EuiSpacer,
} from '@elastic/eui';

import { openLazyFlyout } from '@kbn/presentation-util';
import { apiHasParentApi, useStateFromPublishingSubject } from '@kbn/presentation-publishing';
import React, { Fragment } from 'react';
import { BehaviorSubject } from 'rxjs';
import { WatchService } from '../../services';
import TableTextCell from '../../../components/Table/TableTextCell/TableTextCell';
import { getSeverity, watchStatusToIconProps } from '../../pages/SignalsOperatorView/utils/helpers';
import { serializeAttributes } from './watch_status_utils';

export const watchSelectorOverlay = ({ addPanel, httpClient, stateObservables, core, api }) => {
  const watchService = new WatchService(httpClient);
  const selectableWatches$ = new BehaviorSubject([]);

  const loadWatches = (watchId = null) => {
    const query = { size: 500 };
    if (watchId) {
      query.watch_id = watchId;
    }
    watchService.summary(query).then((response) => {
      selectableWatches$.next(response.resp.data.watches);
    });
  };

  // Use openLazyFlyout helper - opens flyout immediately with loading state
  openLazyFlyout({
    core,
    parentApi: apiHasParentApi(api) ? api.parentApi : undefined,
    flyoutProps: {
      type: 'overlay',
      size: 'm',
    },
    loadContent: async ({ closeFlyout }) => {
      // Load data inside the flyout for better perceived performance
      loadWatches();

      // Return the React component
      return (
        <WatchSelector
          watchService={watchService}
          selectableWatches={selectableWatches$}
          stateObservables={stateObservables}
          onSearch={(watchId) => {
            loadWatches(watchId);
          }}
          onSetWatch={(watchId) => {
            stateObservables.watchId.next(watchId);
            addPanel(serializeAttributes(stateObservables));
          }}
          onClose={closeFlyout}
        />
      );
    },
  });
};

/**
 * The component that renders the flyout markup
 * @param selectableWatches
 * @param onSearch
 * @param onSetWatch
 * @param onClose
 * @returns {Element}
 * @constructor
 */
export const WatchSelector = ({ selectableWatches, onSearch, onSetWatch, onClose }) => {
  const watches = useStateFromPublishingSubject(selectableWatches);

  // Makes the table rows clickable
  const getRowProps = (watch) => {
    return {
      onClick: () => {
        onSetWatch(watch.watch_id);
      },
    };
  };

  const renderLastStatusWithSeverityColumn = (field, watch) => {
    const severityLevel = getSeverity(watch);
    const {
      type: iconType,
      nodeText,
      ...badgeProps
    } = watchStatusToIconProps(watch, watch.active, severityLevel, () => {});

    return (
      <Fragment>
        <EuiFlexGroup
          alignItems={'center'}
          gutterSize={'s'}
          justifyContent={'flexStart'}
          style={{
            padding: '0px 8px',
            backgroundColor: badgeProps.backgroundColor,
            color: badgeProps.color || '#fff',
            fill: badgeProps.color || '#fff',
            borderRadius: '4px',
            maxWidth: '150px',
            minWidth: '120px',
          }}
        >
          <EuiFlexItem grow={false}>
            <EuiIcon type={iconType} size="m" />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>{nodeText}</EuiFlexItem>
        </EuiFlexGroup>
      </Fragment>
    );
  };

  const columns = [
    {
      field: 'status_code',
      name: 'Status',
      footer: 'Status',
      render: renderLastStatusWithSeverityColumn,
    },
    {
      field: 'watch_id',
      name: 'Name',
      footer: 'Name',
      truncateText: true,
      render: (id, watch) => <TableTextCell name={id} value={id} />,
    },
  ];

  return (
    <>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2>Select a watch</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiCallOut title="Watch selection" iconType="bell">
          <p>The watches available here are watches with severity levels defined.</p>
        </EuiCallOut>

        <EuiSpacer size="m" />

        <EuiFormRow
          label="Search for watches"
          helpText="Type any text and press the enter key to trigger a search."
        >
          <EuiFieldSearch
            placeholder="Watch id"
            onSearch={(watchId) => onSearch(watchId)}
            isClearable={true}
          />
        </EuiFormRow>
        <EuiSpacer size="m" />
        <EuiInMemoryTable
          items={watches}
          itemId="watch_id"
          columns={columns}
          rowProps={getRowProps}
          pagination={{
            initialPageSize: 100,
            pageSizeOptions: [10, 20, 50, 100],
          }}
        ></EuiInMemoryTable>
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButton onClick={() => onClose()} >
              Done
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </>
  );
};
