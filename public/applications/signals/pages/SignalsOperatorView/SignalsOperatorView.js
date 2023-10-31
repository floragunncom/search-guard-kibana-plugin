/* eslint-disable @kbn/eslint/require-license-header */
import React, { Component } from 'react';
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
  EuiLink,
  EuiToolTip,
  EuiInMemoryTable,
  EuiI18n,
} from '@elastic/eui';

import {
  actionsText,
  acknowledgeText,
  acknowledgedText,
  acknowledgeActionText,
  lastStatusText,
} from '../../utils/i18n/watch';

import {
  confirmText,
  onText,
  byText,
} from '../../utils/i18n/common';

import { APP_PATH, FLYOUTS, WATCH_ACTION_STATUS, WATCH_STATUS } from '../../utils/constants';
import { get } from 'lodash';

import { LEFT_ALIGNMENT } from '@elastic/eui/lib/services';
import {
  ContentPanel,
  TableIdCell,
  TableTextCell,
} from '../../components';


import { buildESQuery } from '../Watches/utils/helpers';
import {
  watchToFormik,
  dateFormat,
  actionAndWatchStatusToIconProps,
} from '../Watches/utils';

import { TABLE_SORT_DIRECTION } from '../Watches/utils/constants';

import { WatchService } from '../../services';

import { Context } from '../../Context';
import { actionStatusToIconProps, getSeverity, watchStatusToIconProps } from './utils/helpers';

const initialQuery = EuiSearchBar.Query.MATCH_ALL;

const sortFieldToUIMapping = {
  '_ui.state.last_status.code': 'status',
  _id: 'id',
};

// EuiMemoryTable relies on referential equality of a column's name.
// On paginate it passes Eui18N instance.
const sortFieldFromEuiI18nMapping = {
  'sg.watch.lastStatus.text': 'status',
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

    this.state = {
      error: null,
      isLoading: true,
      watches: [],
      tableSelection: [],

      query: tableState.query,
      pagination: tableState.page,
      sorting: tableState.sort,
    };

    this.watchService = new WatchService(context.httpClient);
  }

  componentDidMount() {
    this.getWatches();
  }

  componentWillUnmount() {
    this.context.closeFlyout();
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
      const esQuery = buildESQuery(EuiSearchBar.Query.toESQuery(query));
      console.debug('Watches -- getWatches -- esQuery', esQuery);

      const { resp: watches } = await this.watchService.search(esQuery);
      this.setState({ watches, error: null });
      await this.fetchWatchesState();
      console.debug('Watches -- getWatches', watches);
    } catch (error) {
      console.error('Watches -- getWatches', error);
      this.context.addErrorToast(error);
      this.setState({ error });
    }

    this.setState({ isLoading: false });
    console.debug('Watches -- getWatches -- query', query);
  };


  fetchWatchesState = async () => {
    const { watches } = this.state;
    const promises = [];

    try {
      watches.forEach((watch, i) => {
        const promise = this.watchService
          .summary(watch._tenant)
          .then(({ resp: state = {} } = {}) => {
            watches[i] = watchToFormik(watch, state.data);
          })
          .catch((error) => {
            console.error('Watches -- fetchWatchesState', watch._id, error);
            // Default to empty state
            watches[i] = watchToFormik(watch);
          });

        promises.push(promise);
      });

      await Promise.all(promises);
      this.setState({ watches, error: null });
      console.debug('Watches -- fetchWatchesState', watches);
    } catch (error) {
      console.error('Watches -- fetchWatchesState', error);
      this.setState({ error });
      this.context.addErrorToast(error);
    }
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
        field: 'id',
        direction: TABLE_SORT_DIRECTION,
      },
      page: {
        index: 0,
        size: 10,
      },
    };

    // Merge with whatever is stored in the context
    const contextFilters = this.context.watchesFilters;
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
          ? EuiSearchBar.Query.parse(urlParamsData.query)
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

  renderLastStatusWithSeverityColumn = (field, watch) => {
    const lastWatchStatus = get(watch, '_ui.state.last_status.code');
    const severityLevel = getSeverity(watch);
    
    let actionsToAcknowledge = watch.actions.filter((action) => {
      const wasAcked = get(watch, `_ui.state.actions[${action.name}].acked`, false);
      const ackEnabled = !action.ack_enabled;
      const actionCanBeAcked = ackEnabled && !wasAcked;

      return actionCanBeAcked;
    });

    const { type: iconType, nodeText, ...badgeProps } = watchStatusToIconProps(lastWatchStatus, watch.active, severityLevel, this.handleAck.bind(this, [watch._id], actionsToAcknowledge[0]?.name));

    return (
      <EuiToolTip content={nodeText}>
        <EuiBadge iconType={iconType} {...badgeProps}>
          {nodeText}
        </EuiBadge>
      </EuiToolTip>
    );
  }

  renderActionsColumn = (actions = [], watch) => {
    const lastWatchStatus = get(watch, '_ui.state.last_status.code');
    const severityLevel = getSeverity(watch);
    if (
      !actions.length || 
      !watch.active ||
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
        {actions.map((action, key) => {
          const wasAcked = get(watch, `_ui.state.actions[${action.name}].acked`, false);

          const ackedBy = get(watch, `_ui.state.actions[${action.name}].acked.by`, 'admin');
          const ackedOn = get(watch, `_ui.state.actions[${action.name}].acked.on`);

          const ackEnabled = action.ack_enabled !== false;
          const actionCanBeAcked = ackEnabled && !wasAcked;

          const actionStatus = get(watch, `_ui.state.actions[${action.name}].last_status.code`);
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
              {acknowledgedText} {byText} {ackedBy} {onText} {dateFormat(ackedOn)}
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
              onClick={() => this.handleAck([watch._id], action.name)}
              data-test-subj={`sgTableCol-Actions-ackbtn-${watch._id}-${action.name}`}
            >
              Ack {action.name}
            </EuiLink>
          );

          return (
            <div key={key}>
              <EuiFlexGroup style={{ flexWrap: 'nowrap' }}>
                <EuiFlexItem grow={false} style={{ maxWidth: '35px' }}>
                <EuiToolTip content={actionIconTooltip}>
                    <EuiIcon
                      data-test-subj={`sgTableCol-Actions-icon-${watch._id}-${action.name}`}
                      {...iconProps}
                    />
                  </EuiToolTip>
                </EuiFlexItem>
                <EuiFlexItem style={{ overflow: 'hidden' }}>
                  {actionCanBeAcked ? (
                    <div>{ackLink}</div>
                  ) : (
                    <EuiToolTip content={ackLinkTooltip}>
                      <div
                        style={{
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          width: '100%',
                        }}
                      >
                        {action.name}
                      </div>
                    </EuiToolTip>
                  )}
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
              {acknowledgeActionText} {actionId}
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

    triggerConfirmModal({
      title: (
        <EuiTitle>
          <h2>
            {confirmText} {acknowledgeText}
          </h2>
        </EuiTitle>
      ),
      body: watchIds.join(', '),
      onConfirm: () => {
        triggerConfirmModal(null);
        doAck();
      },
      onCancel: () => {
        triggerConfirmModal(null);
      },
    });
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

  // TODO: have search in URL params too
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
      query: filters.query.text || '',
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

    Object.keys(params).forEach((paramKey) => {
      urlParams.set(paramKey, encodeURIComponent(params[paramKey]));
    });

    history.replace({
      search: urlParams.toString(),
    });

    // Now update the context
    const newContextFilters = this.getTableFilters();
    this.context.setWatchesFilters(newContextFilters);
  }

  handleSearchChange = ({ query, error }) => {
    if (error) {
      this.setState({ error });
    } else {
      const newQuery = query.text ? query : initialQuery;

      this.updateTableFilters({
        query: newQuery.text,
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
        field: '_ui.state.last_status.code',
        name: lastStatusText,
        footer: lastStatusText,
        sortable: true,
        render: this.renderLastStatusWithSeverityColumn,
      },
      {
        field: '_id',
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
      selectable: (doc) => doc._id,
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
      title="Signals Operator View"
      actions={[
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
            itemId="_id"
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
                if (criteria.sort.field?.type === EuiI18n) {
                  criteria.sort.field = sortFieldFromEuiI18nMapping[criteria.sort.field.props.token]
                }
                
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
              pageSize: this.state.pagination.size,
            }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </ContentPanel>)

  }

}

export default SignalsOperatorView