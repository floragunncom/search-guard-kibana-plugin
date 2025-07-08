/* eslint-disable @kbn/eslint/require-license-header */
import React, {Component, Fragment, useState} from 'react';
import {
  EuiBadge,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiSearchBar,
  EuiText,
  EuiTitle,
  EuiIcon,
  EuiToken,
  EuiLink,
  EuiToolTip,
  EuiInMemoryTable,
  EuiI18n,
  EuiAutoRefresh,
  EuiInputPopover,
  EuiSuperSelect,
  EuiSelectable,
  EuiSwitch,
} from '@elastic/eui';

import {
  actionsText,
  acknowledgeText,
  acknowledgedText,
  acknowledgeActionText,
  lastStatusText, acknowledgedActionText, unAcknowledgedActionText,
} from '../../utils/i18n/watch';


import { WATCH_ACTION_STATUS, WATCH_STATUS } from '../../utils/constants';
import { get } from 'lodash';

import { LEFT_ALIGNMENT } from '@elastic/eui/lib/services';
import {
  ContentPanel,
  TableIdCell,
  TableTextCell,
} from '../../components';


import { TABLE_SORT_DIRECTION } from '../Watches/utils/constants';

import { WatchService } from '../../services';

import { Context } from '../../Context';
import { actionStatusToIconProps, getSeverity, watchStatusToIconProps } from './utils/helpers';

/**
 * @typedef {Object} WatchAction
 * @property {string|null} triggered - Timestamp when the action was triggered
 * @property {string|null} checked - Timestamp when the action was checked
 * @property {boolean} check_result - Result of the action check
 * @property {string|null} execution - Execution details
 * @property {string|null} error - Timestamp of error occurrence
 * @property {string|null} status_code - Status code of the action
 * @property {string|null} status_details - Details of the action status
 */

/**
 * @typedef {Object} Watch - TODO This is the watch from the summary response
 * @property {string} watch_id - Unique identifier for the watch
 * @property {string|null} status_code - Status code of the watch
 * @property {string|null} severity - Severity level of the watch
 * @property {string|null} description - Description of the watch or its error
 * @property {string|null} severity_details - Additional details about the severity
 * @property {Object.<string, WatchAction>} actions - Map of action names to their statuses
 * @property {string} tenant - Tenant identifier
 */

/**
 * @typedef {Object} WatchesResponse
 * @property {boolean} ok - Indicates if the request was successful
 * @property {Object} resp - Response body
 * @property {number} resp.status - HTTP status code
 * @property {Object} resp.data - Response data
 * @property {Array<Watch>} resp.data.watches - List of watches
 */

/**
 * @typedef {Object} SignalsOperatorViewState
 * @property {Array<Watch>} watches - List of watches from the API
 * @property {boolean} isLoading - Indicates if data is being loaded
 * @property {Error|null} error - Error object if request failed
 * @property {Array<Watch>} tableSelection - Currently selected watches in the table
 * @property {Object} query - Current search query
 * @property {Object} pagination - Pagination state
 * @property {Object} sorting - Sorting state
 */


const initialQuery = '';

/**
 This simplifies the name for the query parameters a bit, matching shorter values to the actual field name.
 * @type {{status_code: string, watch_id: string}}
 */
const sortFieldToUIMapping = {
  'watch_id': 'id'
};

// EuiMemoryTable relies on referential equality of a column's name.
// On paginate it passes Eui18N instance.
/*
const sortFieldFromEuiI18nMapping = {
  'sg.watch.lastStatus.text': 'status',
};

 */

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

  getPageSize = (defaultPageSize = 100) => {
    const { pagination } = this.state;
    if (this.pageSizeOptions.includes(pagination.size)) {
      return pagination.size;
    } else {
      return defaultPageSize;
    }
  }

  getWatches = async () => {
    const { query } = this.state;
    this.setState({ isLoading: true, error: null });

    try {
      console.debug('Watches -- getWatches -- query', query);

      const filterQuery = {
        size: this.getPageSize(100),
        sorting: '-severity_details.level_numeric',
      };

      if (query) {
        filterQuery.watch_id = query;
      }

      /*
      if (this.state.onlyWithSeverity) {
        filterQuery.severities = ["critical", "error", "warning", "info"];
      }
      */

      const { resp } = await this.watchService.summary(filterQuery);
      const watches = resp.data.watches;
      console.debug('Watches -- getWatches', watches);
      this.setState({ watches, error: null });
      //await this.fetchWatchesState();
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
console.log('Initial query', initialQuery);
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

console.warn('Watches -- setupAutoRefresh', Math.max(5000, autoRefresh.refreshInterval));
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
    //const lastWatchStatus = get(watch, '_ui.state.last_status.code');
    const lastWatchStatus = get(watch, 'status_code');
    const severityLevel = getSeverity(watch);

    let actionsToAcknowledge = Object.keys(watch.actions).filter((actionName) => {
      const action = watch.actions[actionName];
      const wasAcked = action.status_code === 'ACKED';
      const ackEnabled = !action.ack_enabled;
      const actionCanBeAcked = ackEnabled && !wasAcked && action.check_result !== false;

      return actionCanBeAcked;
    });

    const { type: iconType, nodeText, ...badgeProps }
      = watchStatusToIconProps(watch, watch.active, severityLevel, this.handleAck.bind(this, [watch.watch_id], actionsToAcknowledge[0]?.name));

    return (
      <Fragment>
        <EuiToolTip content={nodeText}>
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
    //const lastWatchStatus = get(watch, '_ui.state.last_status.code');
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
          const wasAcked = action.status_code === 'ACKED';

          const ackEnabled = action.ack_enabled !== false;
          const actionCanBeAcked = ackEnabled && !wasAcked && action.check_result !== false;

          const actionStatus = action.status_code;
          const { nodeText, ...statusIconProps } = actionStatusToIconProps(actionStatus, lastWatchStatus, severityLevel);

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
          let actionIconTooltip = nodeText;
          if (!ackEnabled) {
            actionIconTooltip = 'Not acknowledgeable';
          }

          // The tooltip for the action name
          let ackLinkTooltip = wasAcked ? (
            <EuiText size="s">
              ""
            </EuiText>
          ) : (
            acknowledgeText
          );
          // Change the default link tooltip for ack_enabled: false
          if (!ackEnabled) {
            ackLinkTooltip = 'Action not acknowledgeable';
          }

          // Lifting up the link content. There was an issue with
          // the tooltip sticking around after acking an action
          // As a fix we removed the tooltip for actions that
          // can still be acknowledged, it only showed
          // "Acknowledge" anyway
          const ackLink = (
            <EuiLink
              color={'primary'}
              style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                width: '100%',
              }}
              onClick={() => this.handleAck([watch.watch_id], actionName)}
              data-test-subj={`sgTableCol-Actions-ackbtn-${watch.watch_id}-${actionName}`}
            >
              {actionName}
            </EuiLink>
          );

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
                  <EuiToolTip content={ackLinkTooltip}>
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
                  </EuiToolTip>
                </EuiFlexItem>
              </EuiFlexGroup>
            </div>
          );
        })}
      </div>
    );
  };


  handleAck = (watchIds = [], actionId) => {
    const { triggerConfirmModal } = this.context;

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
              {acknowledgeText} watch {id}
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
            {acknowledgedText} watch {id}
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
        /*
        sortable: (watch) => {
          const watchProps = watchStatusToIconProps(watch.status_code, watch.active, getSeverity(watch), () => {});
          const comparatorString = typeof watchProps.nodeText === 'string' ? watchProps.nodeText : watchProps.nodeText.props.default;
          console.log('comparatorString', comparatorString.toLowerCase());
          return comparatorString.toLowerCase();
        },
         */
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
            selection={selection}
            sorting={sorting}
            loading={isLoading}
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
            pagination={{
              pageIndex: this.state.pagination.index,
              pageSize: this.pageSizeOptions.indexOf(this.state.pagination.size) > -1 ? this.state.pagination.size : this.pageSizeOptions[0],
              pageSizeOptions: this.pageSizeOptions,
            }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </ContentPanel>)

  }

}

export default SignalsOperatorView
