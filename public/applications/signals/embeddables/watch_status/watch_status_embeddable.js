import React, {useEffect} from "react";
import { BehaviorSubject} from 'rxjs';
import {
  initializeTitleManager,
  useStateFromPublishingSubject,
  apiHasParentApi,
  apiPublishesReload
} from '@kbn/presentation-publishing';
import {WatchService} from "../../services";
import { WatchBatchManager } from "../../services/WatchBatchManager";
import {
  getSeverity,
  watchStatusToIconProps
} from "../../pages/SignalsOperatorView/utils/helpers";

import { EuiFlexGroup, EuiFlexItem, EuiIcon, EuiText } from '@elastic/eui';
import {WATCH_STATUS_EMBEDDABLE_ID} from "./watch_status_utils";

// Shared batch manager instance for all embeddables
let sharedWatchBatchManager = null;

export const getWatchStatusEmbeddableFactory = ({httpClient}) => {
  const watchService = new WatchService(httpClient);

  // Create shared batch manager only once
  if (!sharedWatchBatchManager) {
    sharedWatchBatchManager = new WatchBatchManager(watchService);
  }

  const embeddableFactory = {
    type: WATCH_STATUS_EMBEDDABLE_ID,
    deserializeState: (serializedState) => {
      return serializedState.rawState;
    },
    buildEmbeddable: (state, buildApi) => {
      const watchId = state.watchId || null;
      const selectedWatchId$ = new BehaviorSubject(watchId);
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
          const loadedWatch = loadedWatches.find(watch => watch.watch_id === watchId) || null;
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

      const titleManager = initializeTitleManager(state);

      const api = buildApi(
        {
          ...titleManager.api,
          dataLoading$,
          blockingError$,
          serializeState: (rawState) => {
            return {
              rawState: {
                ...titleManager.serialize(),
                watchId: selectedWatchId$.getValue(),
              },
            };
          },
        },
        /**
         * Provide state comparators. Each comparator is 3 element tuple:
         * 1) current value (publishing subject)
         * 2) setter, allowing parent to reset value
         * 3) optional comparator which provides logic to diff lasted stored value and current value
         */
        {
          watchId: [selectedWatchId$, (value) => selectedWatchId$.next(value)],
          ...titleManager.comparators,
        }
      );

      // Dashboard controls integration - ONLY listen to refresh button clicks
      let prevRequestAbortController;
      let reloadSubscription;

      // Check if the dashboard has a reload observable (refresh button)
      if (apiHasParentApi(api) && apiPublishesReload(api.parentApi)) {
        // Subscribe directly to the reload observable instead of fetch$
        reloadSubscription = api.parentApi.reload$.subscribe(() => {

          // Cancel any previous request to prevent race conditions
          if (prevRequestAbortController) {
            prevRequestAbortController.abort();
          }

          // Get the current watch ID from our state management
          const currentWatchId = selectedWatchId$.getValue();
          // Exit early if no watch is selected - nothing to reload
          if (!currentWatchId) {
            return;
          }

          // Load the watch data with abort controller
          (async () => {
            try {
              // Create new abort controller for this specific request
              const abortController = new AbortController();
              // Store it so we can cancel this request if user triggers another change
              prevRequestAbortController = abortController;

              // Actually fetch the watch data - this will set loading states internally
              await loadWatch(currentWatchId, abortController.signal);
            } catch (error) {
              // Only log errors that aren't from us cancelling the request
              if (error.name !== 'AbortError') {
                console.error('Error loading watch:', error);
              }
              // AbortErrors are expected when we cancel requests, so we ignore them
            }
          })();
        });
      }

      // Initial load
      if (watchId) {
        loadWatch(watchId);
      }

      return {
        api,
        Component: () => {
          const watchId = useStateFromPublishingSubject(selectedWatchId$);
          const watch = useStateFromPublishingSubject(watch$);
          const isLoading = useStateFromPublishingSubject(dataLoading$);
          const error = useStateFromPublishingSubject(blockingError$);

          useEffect(() => {
            return () => {
              // Clean up the reload subscription when component unmounts
              if (reloadSubscription) {
                reloadSubscription.unsubscribe();
              }
            };
          }, []);

          // Show error state if there's a blocking error
          if (error) {
            return (
              <EuiFlexGroup direction="column" gutterSize="m" justifyContent={"center"} alignItems={"center"}>
                <EuiFlexItem grow={false}>
                  <EuiText color="danger">
                    Error loading watch: {error.message}
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            );
          }

          const renderLastStatusWithSeverityColumn = (watch) => {
            if (!watch) {
              return null;
            }
            const severityLevel = getSeverity(watch);

            const { type: iconType, nodeText, ...badgeProps }
              = watchStatusToIconProps(watch, watch.active, severityLevel, () => {});

            return (
              <EuiFlexGroup
                alignItems={"center"}
                gutterSize={"s"}
                justifyContent={"flexStart"}
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
                <EuiFlexItem grow={false}>
                  {nodeText}
                </EuiFlexItem>
              </EuiFlexGroup>
            );
          }

          return (
            <EuiFlexGroup direction="column" gutterSize="m" justifyContent={"center"} alignItems={"center"}>
              <EuiFlexItem grow={false}>
                <EuiText size="s">
                  <h3>
                    {watchId}
                  </h3>
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
          )
        }
      }
    }
  }

  return embeddableFactory;
}
