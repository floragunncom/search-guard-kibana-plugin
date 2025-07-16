/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import {
  EuiButton,
  EuiButtonEmpty,
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

import { tracksOverlays } from '@kbn/presentation-containers';
import {
  apiHasParentApi,
  useStateFromPublishingSubject,
} from '@kbn/presentation-publishing';
import { toMountPoint } from '@kbn/react-kibana-mount';
import React, {Fragment, useState} from 'react';
import { BehaviorSubject } from 'rxjs';
import {WatchService} from "../../services";
import {TableTextCell} from "../../../components";
import {getSeverity, watchStatusToIconProps} from "../../pages/SignalsOperatorView/utils/helpers";
import {serializeAttributes} from "./watch_status_utils";

export const watchSelectorOverlay = (
  {
    addPanel,
    httpClient,
    stateObservables,
    core,
    api,
  }
) => {
  return new Promise((resolve) => {
    const watchService = new WatchService(httpClient);
    const selectableWatches$ = new BehaviorSubject([]);

    const loadWatches = (watchId = null) => {
      const query = {size: 500};
      if (watchId) {
        query.watch_id = watchId;
      }
      watchService.summary(query)
        .then(response => {
          selectableWatches$.next(response.resp.data.watches);
        });
    }

    loadWatches();

    const closeFlyout = (overlayRef) => {
      if (apiHasParentApi(api) && tracksOverlays(api.parentApi)) {
        api.parentApi.clearOverlays();
      }
      overlayRef.close();
    };


    const flyoutRef = core.overlays.openFlyout(
      toMountPoint(
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
          onCancel={() => {
            closeFlyout(flyoutRef);
          }}
          onSubmit={() => {
            closeFlyout(flyoutRef);
          }}
        />,
        {
          theme: core.theme,
          i18n: core.i18n,
        }
      ),
      {
        type: 'overlay',
        size: 'm',
        onClose: () => closeFlyout(flyoutRef),
      }
    );


  });
};

/**
 * The component that renders the flyout markup
 * @param selectableWatches
 * @param onSearch
 * @param onSetWatch
 * @param onSubmit
 * @param onCancel
 * @returns {Element}
 * @constructor
 */
export const WatchSelector = ({
  selectableWatches,
  onSearch,
  onSetWatch,
  onSubmit,
  onCancel,
  }) => {
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
    const { type: iconType, nodeText, ...badgeProps }
      = watchStatusToIconProps(watch, watch.active, severityLevel, () => {});

    return (
      <Fragment>
        <EuiFlexGroup
          alignItems={"center"}
          gutterSize={"s"}
          justifyContent={"flexStart"}
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
          <EuiFlexItem grow={false}>
            {nodeText}
          </EuiFlexItem>
        </EuiFlexGroup>
      </Fragment>
    );
  }

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
      render: (id, watch) => (
        <TableTextCell
          name={id}
          value={id}
        />
      ),
    },
  ]

  return (
    <>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2>
            Select a watch
          </h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiCallOut
          title="Watch selection"
          iconType="bell"
        >
          <p>
            The watches available here are watches with severity levels defined.
          </p>
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
          >
        </EuiInMemoryTable>
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty iconType="cross" onClick={onCancel} flush="left">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup gutterSize="m" alignItems="center" responsive={false}>
              <EuiFlexItem grow={false}>
                <EuiButton onClick={() => onSubmit()} fill>
                  Done
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </>
  );
};
