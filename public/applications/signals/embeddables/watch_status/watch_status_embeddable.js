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

/**
 * Watch Status Embeddable for Kibana 9.1.x
 *
 * This embeddable displays the status of a Search Guard watch in a dashboard panel.
 *
 * Architecture:
 * - Read-only display (no inline editing of watch data)
 * - Uses simple BehaviorSubjects for state management
 * - Only responds to dashboard refresh button (not time range/filters)
 * - Supports title editing with unsaved changes tracking
 * - Uses batch loading via WatchBatchManager for efficiency
 *
 * Key 9.1.x Changes:
 * - buildEmbeddable receives single context object
 * - No deserializeState method (removed)
 * - Must import titleComparators from @kbn/presentation-publishing
 * - Unsaved changes use new object-based API
 * - parentApi accessed from context, not api.parentApi
 */
import React, { useEffect } from 'react';
import { BehaviorSubject } from 'rxjs';
import {
  initializeTitleManager,
  useStateFromPublishingSubject,
  apiPublishesReload,
  titleComparators,
} from '@kbn/presentation-publishing';
import { initializeUnsavedChanges } from '@kbn/presentation-containers';
import { WatchService } from '../../services';
import { WatchBatchManager } from '../../services/WatchBatchManager';
import { getSeverity, watchStatusToIconProps } from '../../pages/SignalsOperatorView/utils/helpers';

import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiText } from '@elastic/eui';
import { WATCH_STATUS_EMBEDDABLE_ID } from './watch_status_utils';

// Shared batch manager instance for all embeddables
let sharedWatchBatchManager = null;

export const getWatchStatusEmbeddableFactory = ({ httpClient }) => {
  const watchService = new WatchService(httpClient);

  // Create shared batch manager only once
  if (!sharedWatchBatchManager) {
    sharedWatchBatchManager = new WatchBatchManager(watchService);
  }

  const embeddableFactory = {
    type: WATCH_STATUS_EMBEDDABLE_ID,
    /**
     * buildEmbeddable: Creates and initializes the embeddable
     *
     * KIBANA 9.1.x CHANGES:
     * - No more deserializeState method (removed)
     * - Receives single 'context' object instead of separate parameters
     * - Must use 'serializedState' (not 'initialState') when calling addNewPanel
     */
    buildEmbeddable: async (context) => {
      // Destructure the context object (new 9.1.x pattern)
      const { initialState, finalizeApi, parentApi, uuid } = context;

      // Extract our state from initialState.rawState
      const state = initialState?.rawState || {};

      /**
       * State Management using simple BehaviorSubjects
       * 1. This is a read-only display embeddable (no inline editing)
       * 2. watchId is set once at creation and never changes
       * 3. Only the panel title can be edited by users
       */
      const watchId$ = new BehaviorSubject(state.watchId || null);
      const watch$ = new BehaviorSubject(null);
      const dataLoading$ = new BehaviorSubject(false);
      const blockingError$ = new BehaviorSubject(undefined);

      const loadWatch = async (watchId, abortSignal) => {
        if (!watchId) {
          watch$.next(null);
          return;
        }

        try {
          dataLoading$.next(true);
          blockingError$.next(undefined);

          const response = await sharedWatchBatchManager.requestWatch(watchId);

          // Check if request was aborted
          if (abortSignal?.aborted) {
            return;
          }

          const loadedWatches = response.resp.data.watches || [];

          // Find the watch with the same id
          const loadedWatch = loadedWatches.find((watch) => watch.watch_id === watchId) || null;
          watch$.next(loadedWatch);
        } catch (error) {
          if (abortSignal?.aborted) {
            return;
          }
          console.error('Error loading watch:', error);
          blockingError$.next(error);
        } finally {
          dataLoading$.next(false);
        }
      };

      // Initialize title manager (handles panel title, description, hidePanelTitles)
      const titleManager = initializeTitleManager(state);

      /**
       * serializeState: Converts current state to the format saved in the dashboard
       * This is called when the dashboard is saved
       */
      const serializeState = () => ({
        rawState: {
          ...titleManager.getLatestState(),  // Include title/description
          watchId: watchId$.getValue(),       // Include our custom state
        },
      });

      /**
       * Unsaved Changes Tracking (new 9.1.x API):
       *
       * Why we need this:
       * - Users can edit the panel title/description
       * - Dashboard needs to show "unsaved changes" badge when a panel is added or title/description changes
       *
       * Key points:
       * - watchId doesn't change after panel creation, so we only track title
       */
      const unsavedChangesApi = initializeUnsavedChanges({
        uuid,
        parentApi,
        serializeState,
        anyStateChange$: titleManager.anyStateChange$,  // Only emit when title changes
        getComparators: () => titleComparators,
        onReset: (lastSaved) => {
          titleManager.reinitializeState(lastSaved?.rawState);
        },
      });

      /**
       * Build the embeddable API:
       * - Spread unsavedChangesApi first (provides unsaved changes tracking)
       * - Then spread titleManager.api (provides title/description observables)
       * - Add our custom observables (dataLoading$, blockingError$)
       */
      const api = finalizeApi({
        ...unsavedChangesApi,
        ...titleManager.api,
        dataLoading$,
        blockingError$,
        serializeState,
      });

      /**
       * Dashboard Controls Integration:
       *
       * We use REFRESH BUTTON ONLY (reload$) instead of fetch$.
       * In addition, if the dashboard is configured to refresh on a given
       * time interval, the embeddable will also refresh automatically.
       *
       * Why NOT fetch$?
       * - fetch$ responds to ALL dashboard controls (time range, filters, queries)
       * - This embeddable displays watch status which doesn't change based on those controls
       * - Would cause unnecessary reloads on every dashboard control change
       *
       * Why reload$ only?
       * - Users explicitly click refresh when they want updated data
       * - Simpler implementation
       * - Better performance (no unnecessary reloads)
       *
       */
      let prevRequestAbortController;
      let reloadSubscription;

      if (parentApi && apiPublishesReload(parentApi)) {
        reloadSubscription = parentApi.reload$.subscribe(() => {
          // Cancel any in-flight request to prevent race conditions
          if (prevRequestAbortController) {
            prevRequestAbortController.abort();
          }

          const currentWatchId = watchId$.getValue();
          if (!currentWatchId) return;

          // Async IIFE to handle the reload
          (async () => {
            try {
              const abortController = new AbortController();
              prevRequestAbortController = abortController;
              await loadWatch(currentWatchId, abortController.signal);
            } catch (error) {
              // Ignore AbortError (expected when we cancel requests)
              if (error.name !== 'AbortError') {
                console.error('Error loading watch:', error);
              }
            }
          })();
        });
      }

      // Initial load when embeddable is first created
      if (state.watchId) {
        loadWatch(state.watchId);
      }

      return {
        api,
        Component: () => {
          // Subscribe to our observables to get current values
          const watchId = useStateFromPublishingSubject(watchId$);
          const watch = useStateFromPublishingSubject(watch$);
          const isLoading = useStateFromPublishingSubject(dataLoading$);
          const error = useStateFromPublishingSubject(blockingError$);

          useEffect(() => {
            // Cleanup function: unsubscribe when component unmounts to prevent memory leaks
            return () => {
              if (reloadSubscription) {
                reloadSubscription.unsubscribe();
              }
            };
          }, []);

          // Show error state if there's a blocking error
          if (error) {
            return (
              <EuiFlexGroup
                direction="column"
                gutterSize="m"
                justifyContent={'center'}
                alignItems={'center'}
              >
                <EuiFlexItem grow={false}>
                  <EuiText color="danger">Error loading watch: {error.message}</EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            );
          }

          const renderLastStatusWithSeverityColumn = (watch) => {
            if (!watch) {
              return null;
            }
            const severityLevel = getSeverity(watch);

            const {
              type: iconType,
              nodeText,
              ...badgeProps
            } = watchStatusToIconProps(watch, watch.active, severityLevel, () => {});

            return (
              <EuiFlexGroup
                alignItems={'center'}
                gutterSize={'s'}
                justifyContent={'flexStart'}
                style={{
                  padding: '10px 18px',
                  backgroundColor: badgeProps.backgroundColor,
                  color: badgeProps.color || '#fff',
                  fill: badgeProps.color || '#fff',
                  borderRadius: '8px',
                  maxWidth: '250px',
                  minWidth: '120px',
                  fontSize: '2rem',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <EuiFlexItem grow={false}>
                  <EuiIcon type={iconType} size="xl" />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>{nodeText}</EuiFlexItem>
              </EuiFlexGroup>
            );
          };

          return (
            <EuiFlexGroup
              direction="column"
              gutterSize="m"
              justifyContent={'center'}
              alignItems={'center'}
              style={{ paddingLeft: 5, paddingRight: 5 }}
            >
              <EuiFlexItem grow={false}>
                <EuiText size="s">
                  <h3>{watchId}</h3>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem
                grow={false}
                style={{
                  paddingBottom: '10px',
                }}
              >
                {renderLastStatusWithSeverityColumn(watch)}
              </EuiFlexItem>
            </EuiFlexGroup>
          );
        },
      };
    },
  };

  return embeddableFactory;
};
