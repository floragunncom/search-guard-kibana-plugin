/* eslint-disable @kbn/eslint/require-license-header */
import React, {Component, Fragment, useState} from 'react';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiSearchBar,
  EuiText,
  EuiIcon,
  EuiToken,
  EuiLink,
  EuiToolTip,
  EuiInMemoryTable,
  EuiAutoRefresh,
  EuiEmptyPrompt,
  EuiTitle,
} from '@elastic/eui';

import {
  actionsText,
  acknowledgeText,
  acknowledgedText,
  acknowledgedActionText, unAcknowledgedActionText, unAcknowledgedText,
} from '../../utils/i18n/watch';


import { WATCH_STATUS, APP_PATH } from '../../utils/constants';
import { get } from 'lodash';

import { LEFT_ALIGNMENT } from '@elastic/eui/lib/services';
import {
  ContentPanel,
  TableTextCell,
} from '../../components';

import { WatchService } from '../../services';

import { Context } from '../../Context';
import { actionStatusToIconProps, getSeverity, watchStatusToIconProps } from './utils/helpers';

const initialQuery = '';

/**
 This simplifies the name for the query parameters a bit, matching shorter values to the actual field name.
 * @type {{status_code: string, watch_id: string}}
 */
const sortFieldToUIMapping = {
  'watch_id': 'id'
};

const sortFieldFromUIMapping = Object.keys(sortFieldToUIMapping).reduce((acc, field) => {
  acc[sortFieldToUIMapping[field]] = field;
  return acc;
}, {});


class SignalsOperatorView extends Component {
  static contextType = Context;
  constructor(props, context) {
    super(props, context);

    const tableState = this.getTableFilters();
    this.syncFiltersWithURL(tableState);

    /**
     * @type {SignalsOperatorViewState}
     */
    this.state = {
      error: null,
      isLoading: true,
      watches: [],
      tableSelection: [],
      autoRefresh: {
        isPaused: false,
        refreshInterval: 10000,
        intervalUnit: 's',
      },
      query: tableState.query,
      pagination: tableState.page,
      sorting: tableState.sort,
    };


    this.watchService = new WatchService(context.httpClient);
    this.pageSizeOptions = [10, 20, 50, 100];
    this.autoRefreshInterval = null;
  }

  componentDidMount() {
    this.getWatches();
    this.setupAutoRefresh();

  }

  componentWillUnmount() {
    this.context.closeFlyout();
    // Clear the auto-refresh interval
    this.clearAutoRefreshInterval();

  }

  componentDidUpdate(_, prevState) {
    const { query: prevQuery } = prevState;
    const { query } = this.state;

    if (JSON.stringify(query) !== JSON.stringify(prevQuery)) {
      this.getWatches();
    }
  }

  getWatches = async () => {
    const { query } = this.state;
    this.setState({ isLoading: true, error: null });

    try {
      console.debug('Watches -- getWatches -- query', query);

      const filterQuery = {
        size: 500,
      };

      if (query) {
        filterQuery.watch_id = query;
      }


      const { resp } = await this.watchService.summary(filterQuery);
      const watches = resp.data.watches;
      console.debug('Watches -- getWatches', watches);
      this.setState({ watches, error: null });
      console.debug('Watches -- getWatches', watches);
    } catch (error) {
      console.error('Watches -- getWatches', error);
      this.context.addErrorToast(error);
      this.setState({ error });
    }

    this.setState({ isLoading: false });
    console.debug('Watches -- getWatches -- query', query);
  };




  /**
   * Get table filters
   * Default values < Context values < Query Param values
   * @returns {{query: (Query|*), sort: {field: *, direction: *}, page: {size: (number|*), index: (number|*)}}}
   */
  getTableFilters() {
    const { history } = this.props;
    const urlParamsData = {};
    const urlParams = new URLSearchParams(history.location.search);

    const validParams = ['query', 'sortField', 'sortDirection', 'pageIndex', 'pageSize'];
    for (const [key, value] of urlParams.entries()) {
      if (validParams.includes(key)) {
        urlParamsData[key] = decodeURIComponent(value);
      }
    }
    const defaultFilters = {
      query: initialQuery,
      sort: {
        //field: 'name',
        //direction: TABLE_SORT_DIRECTION,
      },
      page: {
        index: 0,
        size: 100,
      },
    };

    // Merge with whatever is stored in the context
    const contextFilters = this.context.operatorViewWatchesFilters;
    const withContextFilters = {
      ...defaultFilters,
      ...contextFilters,
      sort: {
        ...defaultFilters.sort,
        ...contextFilters.sort,
      },
      page: {
        ...defaultFilters.page,
        ...contextFilters.page,
      },
    };

    // ...and finally, merge with the query parameter filters
    const filters = {
      query:
        urlParamsData.query !== undefined
          ? urlParamsData.query
          : withContextFilters.query,
      sort: {
        field:
          urlParamsData.sortField !== undefined
            ? urlParamsData.sortField
            : withContextFilters.sort.field,
        direction: urlParamsData.sortDirection || withContextFilters.sort.direction,
      },
      page: {
        // pageIndex 0 would be falsey, but that's ok as long as the default is 0
        index: urlParamsData.pageIndex
          ? parseInt(urlParamsData.pageIndex, 10)
          : withContextFilters.page.index,
        size: urlParamsData.pageSize
          ? parseInt(urlParamsData.pageSize, 10)
          : withContextFilters.page.size,
      },
    };

    // If the index isn't a number, weird things happen with the table
    if (isNaN(filters.page.index)) {
      filters.page.index = 0;
    }

    return filters;
  }

  setupAutoRefresh = () => {
    // Clear any existing interval first
    this.clearAutoRefreshInterval();

    const { autoRefresh } = this.state;

    // Don't set up interval if auto-refresh is paused
    if (autoRefresh.isPaused) {
      return;
    }

    // Set up new interval with the converted time
    // Let's keep the interval at least 5 seconds
    this.autoRefreshInterval = setInterval(() => {
      this.getWatches();
    }, Math.max(5000, autoRefresh.refreshInterval));
  }

  clearAutoRefreshInterval = () => {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = null;
    }
  }


  renderLastStatusWithSeverityColumn = (field, watch) => {

    const severityLevel = getSeverity(watch);

    let actionsToAcknowledge = Object.keys(watch.actions).filter((actionName) => {
      const action = watch.actions[actionName];
      // See explanation for not using the status codee in actionStatusToIconProps
      //const wasAcked = (action.status_code === 'ACKED' && action.ack_by) ? true : false;
      const wasAcked = (action.ack_by) ? true : false;
      const ackEnabled = !action.ack_enabled;
      const actionCanBeAcked = ackEnabled && !wasAcked && action.check_result !== false;

      return actionCanBeAcked;
    });

    const { type: iconType, nodeText, ...badgeProps }
      = watchStatusToIconProps(watch, (actionsToAcknowledge.length) ? true : false, severityLevel, () => {
        if (actionsToAcknowledge.length > 0) {
          this.handleAck([watch.watch_id]);
        } else {
          this.handleUnAck([watch.watch_id]);
        }
    });

    let tooltip = nodeText;
    if (actionsToAcknowledge.length > 0) {
      tooltip = `Click to acknowledge all actions`;
    }

    return (
      <Fragment>
        <EuiToolTip content={tooltip}>
        <EuiFlexGroup alignItems={"center"} gutterSize={"s"} justifyContent={"flexStart"}
          style={{
            padding: '0px 8px',
            backgroundColor: badgeProps.backgroundColor,
            color: badgeProps.color || '#fff',
            fill: badgeProps.color || '#fff',
            borderRadius: '4px',
            maxWidth: '150px',
            minWidth: '120px',
            cursor: badgeProps.onClick ? 'pointer' : 'default',
          }}
        {...(badgeProps.onClick ? { onClick: badgeProps.onClick } : {})}
        >
          <EuiFlexItem grow={false}>
            <EuiIcon type={iconType} size="m" />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            {nodeText}
          </EuiFlexItem>
        </EuiFlexGroup>
        </EuiToolTip>
      </Fragment>
    );
  }

  renderActionsColumn = (actions = [], watch) => {
    const lastWatchStatus = watch.status_code;
    const severityLevel = getSeverity(watch);
    const actionsLength = Object.values(watch.actions).length;
    if (
      !actionsLength ||
      watch.active === false ||
      lastWatchStatus == WATCH_STATUS.EXECUTION_FAILED
      ) {
      //Failed and disabled watches do not have their actions displayed.
      return (
        <div style={{ overflow: 'hidden' }}>
          <EuiFlexGroup>
          </EuiFlexGroup>
        </div>
      );
    }

    return (
      <div style={{ overflow: 'hidden', width: '100%' }}>

        {Object.keys(actions).map((actionName, key) => {
          const action = actions[actionName];
          // See explanation for not using the status codee in actionStatusToIconProps
          //const wasAcked = action.status_code === 'ACKED' || action.ack_by;
          const wasAcked = action.ack_by;

          const ackEnabled = action.ack_enabled !== false;
          const actionCanBeAcked = ackEnabled && !wasAcked && action.check_result !== false;

          const { nodeText, tooltip, ...statusIconProps } = actionStatusToIconProps(watch, action, severityLevel);

          let iconProps = statusIconProps;

          // If the action hasn't been executed yet, we'd get an exclamation mark.
          // But since we know that the action can't be acked we can use the
          // right action already.
          if (!ackEnabled) {
            iconProps = {
              type: 'faceHappy',
              color: '#007515',
              'aria-label': 'Not acknowledgable',
            };
          }

          // The action icon tooltip
          let actionIconTooltip = tooltip || nodeText;
          if (!ackEnabled) {
            actionIconTooltip = 'Not acknowledgeable';
          }

          // Change the default link tooltip for ack_enabled: false
          if (!ackEnabled) {
            actionIconTooltip = 'Action not acknowledgeable';
          }

          return (
            <div key={key}>
              <EuiFlexGroup alignItems={"center"} style={{ flexWrap: 'nowrap', paddingTop: actionsLength > 1 ? '2px' : 'inherit', paddingBottom: actionsLength > 1 ? '2px' : 'inherit' }}>
                <EuiFlexItem grow={false} style={{ maxWidth: '35px' }}>
                  <EuiToolTip content={actionIconTooltip}>
                    <EuiToken
                      className="eui-alignMiddle"
                      iconType={iconProps.type}
                      fill={"dark"}
                      size={"m"}
                      shape={"square"}
                      style={{
                        color: iconProps.color,
                        backgroundColor: iconProps.backgroundColor,
                        cursor: actionCanBeAcked || wasAcked ? 'pointer' : 'default',
                      }}
                      onClick={() => {
                        if (wasAcked) {
                          this.handleUnAck([watch.watch_id], actionName);
                        } else if (actionCanBeAcked) {
                          this.handleAck([watch.watch_id], actionName);
                        }
                      }}
                      data-test-subj={`sgTableCol-Actions-ackbtn-${watch.watch_id}-${actionName}`}
                    ></EuiToken>
                  </EuiToolTip>
                </EuiFlexItem>
                <EuiFlexItem style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      width: '100%',
                    }}
                  >
                    {actionName}
                  </div>
                </EuiFlexItem>
              </EuiFlexGroup>
            </div>
          );
        })}
      </div>
    );
  };


  handleAck = (watchIds = [], actionId) => {
    const doAck = async () => {
      this.setState({ isLoading: true });

      try {
        const promises = [];
        watchIds.forEach((id) => {
          promises.push(this.watchService.ack(id, actionId));
        });

        await Promise.all(promises);

        watchIds.forEach((id) => {
          const successMsg = !actionId ? (
            <EuiText>
              {acknowledgedText} watch {id}
            </EuiText>
          ) : (
            <EuiText>
              {acknowledgedActionText} {actionId}
            </EuiText>
          );
          this.context.addSuccessToast(successMsg);
        });
      } catch (error) {
        console.error('Watches -- acknowledge watch', error);
        this.context.addErrorToast(error);
      }

      this.setState({ isLoading: false });
      this.getWatches();
    };

    doAck();
  };

  handleUnAck = async(watchIds = [], actionId) => {
    this.setState({ isLoading: true });

    try {
      const promises = [];
      watchIds.forEach((id) => {
        promises.push(this.watchService.unAck(id, actionId));
      });

      await Promise.all(promises);

      // TODO/Maybe Unacking a watch is not really implemented
      watchIds.forEach((id) => {
        const successMsg = !actionId ? (
          <EuiText>
            {unAcknowledgedText} watch {id}
          </EuiText>
        ) : (
          <EuiText>
            {unAcknowledgedActionText} {actionId}
          </EuiText>
        );
        this.context.addSuccessToast(successMsg);
      });
    } catch (error) {
      console.error('Watches -- unacknowledge action', error);
      this.context.addErrorToast(error);
    }

    this.setState({ isLoading: false });
    this.getWatches();

  };

  renderSearchBarToolsLeft = () => {
    const { tableSelection, isLoading } = this.state;
    if (tableSelection.length === 0) return null;

    const handleMultiAcknowledge = () => {
      this.handleAck(tableSelection.map((item) => item._id));
      this.setState({ tableSelection: [] });
    };

    return (
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiButton
            iconType="check"
            onClick={handleMultiAcknowledge}
            isDisabled={isLoading}
            isLoading={isLoading}
          >
            {acknowledgeText} {tableSelection.length}
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  renderSearchBar = () => {
    const areRowsSelected = !!this.state.tableSelection.length;

    return (
      <EuiFlexGroup>
        {areRowsSelected && (
          <EuiFlexItem grow={false}>{this.renderSearchBarToolsLeft()}</EuiFlexItem>
        )}
        <EuiFlexItem>
          <EuiSearchBar defaultQuery={this.state.query} onChange={this.handleSearchChange} />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  /**
   * Get the filters in a format that can be used
   * to update the url's query parameters
   * @param watchesFilters
   */
  syncFiltersWithURL(watchesFilters = null) {
    const filters = watchesFilters || this.getTableFilters();

    const params = {
      query: filters.query || '',
      pageIndex: filters.page.index,
      pageSize: filters.page.size,
      sortField: filters.sort.field,
      sortDirection: filters.sort.direction,
    };

    this.updateTableFilters(params);
  }

  /**
   * Stores the table filters as query parameters and in the context
   * @param params
   */
  updateTableFilters(params) {
    if (Object.keys(params).length === 0) {
      return;
    }
    const { history } = this.props;
    const urlParams = new URLSearchParams(history.location.search);

    // Remove undefined values from params
    Object.keys(params).forEach((paramKey) => {
      if (params[paramKey] === undefined) {
        urlParams.delete(paramKey);
      } else {
        urlParams.set(paramKey, encodeURIComponent(params[paramKey]));
      }
    });

    history.replace({
      search: urlParams.toString(),
    });

    // Now update the context
    const newContextFilters = this.getTableFilters();
    this.context.setOperatorViewWatchesFilters(newContextFilters);
  }

  handleSearchChange = ({ query, error }) => {
    if (error) {
      this.setState({ error });
    } else {
      const newQuery = query.text ? query.text : initialQuery;

      this.updateTableFilters({
        query: newQuery,
      });

      this.setState({
        error: null,
        query: newQuery,
      });
    }
  };

  render() {
    const { history } = this.props;
    const { watches, isLoading, error } = this.state;

    const columns = [
      {
        field: 'status_code',
        name: 'Status',
        footer: 'Status',
        render: this.renderLastStatusWithSeverityColumn,
      },
      {
        field: 'watch_id',
        name: 'Name',
        footer: 'Name',
        alignment: LEFT_ALIGNMENT,
        truncateText: true,
        sortable: true,
        render: (id, watch) => (
          <TableTextCell
            name={id}
            value={id}
          />
        ),
      },
      {
        field: 'actions',
        truncateText: true,
        name: actionsText,
        footer: actionsText,
        render: this.renderActionsColumn,
      }
    ];

    // Not used right now, but maybe in the future
    const selection = {
      selectable: (doc) => doc.watch_id,
      onSelectionChange: (tableSelection) => {
        this.setState({ tableSelection });
      },
    };

    const sorting = {
      sort: {
        field:
          sortFieldFromUIMapping[this.state.sorting.field?.toLowerCase()] ||
          this.state.sorting.field,
        direction: this.state.sorting.direction,
      },
    };

    const pagination = {
      pageIndex: this.state.pagination.index,
      pageSize: this.pageSizeOptions.indexOf(this.state.pagination.size) > -1 ? this.state.pagination.size : this.pageSizeOptions[0],
      pageSizeOptions: this.pageSizeOptions,
    }

    console.warn('Pagination', pagination);

    return (<ContentPanel
      actions={[
        <EuiAutoRefresh
         isPaused={this.state.autoRefresh.isPaused}
         minInterval={5000}
          refreshInterval={this.state.autoRefresh.refreshInterval}
          onRefreshChange={(refreshSettings) => {
            this.setState({
              autoRefresh: refreshSettings
            }, () => {
              // When settings change, reconfigure the auto-refresh interval
              this.setupAutoRefresh();
            });

          }}
          data-test-subj="refreshButton"
        ></EuiAutoRefresh>,
        <EuiButton
          iconType="refresh"
          onClick={() => {
            this.getWatches();
          }}
          isDisabled={isLoading}
          isLoading={isLoading}
        >
          Refresh
        </EuiButton>
      ]}
    >
      {this.renderSearchBar()}
      <EuiSpacer />
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiInMemoryTable
            hasActions
            error={get(error, 'message')}
            items={watches}
            itemId="watch_id"
            columns={columns}
            sorting={sorting}
            loading={isLoading}
            noItemsMessage={(
              <EuiEmptyPrompt
                title={<h2>No watches found</h2>}
                body={<p>The Operator View shows all watches with severity levels defined. Navigate to the Watches tab to see all watches or to create or edit a watch</p>}
                actions={
                  <EuiButton
                    fill
                    onClick={() => this.props.history.push(APP_PATH.WATCHES)}
                  >
                    Go to the Watches tab
                  </EuiButton>
                }
                footer={
                  <>
                    <EuiTitle size="xxs">
                      <h3>Want to learn more?</h3>
                    </EuiTitle>
                    <EuiLink href="https://docs.search-guard.com/latest/elasticsearch-alerting" target="_blank">
                      Search Guard Signals Alerting documentation
                    </EuiLink>
                  </>
                }
              />
            )}
            onTableChange={(criteria) => {
              // We only update params that have changed. A bit too
              // much perhaps, but that keeps the URL clean(er).
              const newParams = {};
              if (criteria.page.index !== this.state.pagination.index) {
                newParams.pageIndex = criteria.page.index;
              }
              if (criteria.page.size !== this.state.pagination.size) {
                newParams.pageSize = criteria.page.size;
              }

              if (criteria.sort.field !== this.state.sorting.field) {
                /*
                if (criteria.sort.field?.type === EuiI18n) {
                  criteria.sort.field = sortFieldFromEuiI18nMapping[criteria.sort.field.props.token]
                }
                 */

                // We may need to map the reported field name to a more user friendly value
                criteria.sort.field =
                  sortFieldToUIMapping[criteria.sort.field] || criteria.sort.field;
                newParams.sortField = criteria.sort.field;
              }

              if (criteria.sort.direction !== this.state.sorting.direction) {
                newParams.sortDirection = criteria.sort.direction;
              }

              this.setState({
                pagination: criteria.page,
                sorting: criteria.sort,
              });

              this.updateTableFilters(newParams);
            }}
            isSelectable
            pagination={pagination}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </ContentPanel>)

  }

}

export default SignalsOperatorView
