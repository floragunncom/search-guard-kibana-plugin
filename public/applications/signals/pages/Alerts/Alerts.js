/* eslint-disable @osd/eslint/require-license-header */
import React, { Component, Fragment } from 'react';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import { LEFT_ALIGNMENT } from '@elastic/eui/lib/services';
import {
  EuiInMemoryTable,
  EuiBadge,
  EuiFlexItem,
  EuiFlexGroup,
  EuiIcon,
  EuiHealth,
  EuiSearchBar,
  EuiToolTip,
  EuiSpacer,
} from '@elastic/eui';
import { get, isEqual, defaults } from 'lodash';
import moment from 'moment';
import { AlertService } from '../../services';
import {
  DatePicker,
  ContentPanel,
  TableMultiDeleteButton,
  TableDeleteAction,
  TableIdCell,
  TableTextCell,
  CancelButton,
} from '../../components';
import { getResourceEditUri } from '../Watches/utils/helpers';
import { buildESQuery } from './utils/helpers';
import { actionAndWatchStatusToIconProps } from '../Watches/utils';
import { execEndText, statusText, executionHistoryText } from '../../utils/i18n/watch';
import { deleteText } from '../../utils/i18n/common';
import {
  APP_PATH,
  DEFAULT_DATEFIELD,
  WATCH_ACTION_STATUS,
  WATCH_STATUS,
} from '../../utils/constants';
import { TABLE_SORT_FIELD, TABLE_SORT_DIRECTION, DEFAULT_URL_PARAMS } from './utils/constants';

import { Context } from '../../Context';

const initialQuery = EuiSearchBar.Query.MATCH_ALL;

class Alerts extends Component {
  static contextType = Context;

  constructor(props, context) {
    super(props, context);

    this.timer = null;
    this.state = {
      query: initialQuery,
      alerts: [],
      isLoading: true,
      error: null,
      tableSelection: [],
    };

    this.alertService = new AlertService(context.httpClient);
  }

  componentDidMount() {
    this.getAlerts();
  }

  componentDidUpdate(prevProps, prevState) {
    const { location, history } = this.props;
    const prevUrlParams = queryString.parse(prevProps.location.search);
    const urlParams = queryString.parse(location.search);
    const { query: prevQuery } = prevState;
    const { query } = this.state;

    if (!isEqual(urlParams, prevUrlParams)) {
      history.push({ search: queryString.stringify(urlParams) });
    }

    if (!isEqual(urlParams, prevUrlParams) || !isEqual(query, prevQuery)) {
      this.getAlerts();
    }
  }

  componentWillUnmount() {
    this.context.closeFlyout();
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  getAlerts = async () => {
    const { query } = this.state;
    const { location } = this.props;

    const { dateGte, dateLt, watchId } = defaults(
      queryString.parse(location.search),
      DEFAULT_URL_PARAMS
    );

    try {
      const esQuery = buildESQuery({
        query: EuiSearchBar.Query.toESQuery(query),
        gte: dateGte,
        lte: dateLt,
        watchId,
      });
      console.debug('Alerts -- getAlerts -- esQuery', esQuery);

      this.setState({ isLoading: true });
      try {
        const { resp: alerts } = await this.alertService.search(esQuery);
        this.setState({ alerts });
      } catch (error) {
        console.error('Alerts -- getAlerts', error);
        this.setState({ error });
        this.context.addErrorToast(error);
      }
    } catch (error) {
      console.error('Alerts -- build ES query', error);
    }

    this.setState({ isLoading: false });
  };

  deleteAlerts = async (alerts = []) => {
    const promises = [];
    this.setState({ isLoading: true });

    alerts.forEach(({ id, index }) => {
      const promise = this.alertService
        .delete({ id, index })
        .then(() => {
          this.context.addSuccessToast(
            <p>
              {deleteText} {id}
            </p>
          );
        })
        .catch(error => {
          console.error('Alerts -- deleteAlert', error);
          this.context.addErrorToast(error);
        });
      promises.push(promise);
    });

    await Promise.all(promises);
    this.setState({ isLoading: false });

    this.getAlerts();
  };

  handleDeleteAlerts = (alerts = []) => {
    const { triggerConfirmDeletionModal } = this.context;
    triggerConfirmDeletionModal({
      body: alerts.map(({ id }) => id).join(', '),
      onConfirm: () => {
        this.deleteAlerts(alerts);
        triggerConfirmDeletionModal(null);
      },
      onCancel: () => {
        this.setState({ tableSelection: [] });
        triggerConfirmDeletionModal(null);
      },
    });
  };

  handleSearchChange = ({ query, error }) => {
    if (error) {
      this.setState({ error });
    } else {
      this.setState({ error: null, query });
    }
  };

  // TODO: have search in URL params too
  renderSearchBar = () => {
    const areRowsSelected = !!this.state.tableSelection.length;

    const filters = [
      {
        type: 'field_value_selection',
        field: 'status.code',
        name: 'Watch Status',
        multiSelect: 'or',
        options: this.renderSearchFilterOptions(Object.values(WATCH_STATUS)),
      },
      {
        type: 'field_value_selection',
        field: 'actions.status.code',
        name: 'Action Status',
        multiSelect: 'or',
        options: this.renderSearchFilterOptions(Object.values(WATCH_ACTION_STATUS)),
      },
    ];

    return (
      <EuiFlexGroup>
        {areRowsSelected && <EuiFlexItem grow={false}>{this.renderSearchToolsLeft()}</EuiFlexItem>}
        <EuiFlexItem>
          <EuiSearchBar onChange={this.handleSearchChange} filters={filters} />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  handleDatePickerChange = ({
    start: dateGte,
    end: dateLt,
    refreshInterval,
    isPaused,
    isRefreshingWithNoChange,
  }) => {
    const { location, history } = this.props;
    const prevUrlParams = queryString.parse(location.search);
    const urlParams = { ...prevUrlParams, refreshInterval, isPaused, dateGte, dateLt };
    if (!isEqual(prevUrlParams, urlParams)) {
      history.push({ search: queryString.stringify(urlParams) });
    }

    if (isRefreshingWithNoChange) {
      this.getAlerts();
    }
  };

  renderSearchToolsLeft = () => {
    const { tableSelection, isLoading } = this.state;
    if (tableSelection.length === 0) return null;

    const handleMultiDelete = () => {
      this.handleDeleteAlerts(
        tableSelection.map(item => ({
          id: item._id,
          index: item._index,
        }))
      );
      this.setState({ tableSelection: [] });
    };

    return (
      <TableMultiDeleteButton
        isLoading={isLoading}
        onClick={handleMultiDelete}
        numOfSelections={tableSelection.length}
      />
    );
  };

  renderActionsColumns = (actions = [], { status: watchStatus, watch_id: watchId }) => {
    if (!actions || !actions.length) {
      const { nodeText, type: iconType, ...iconProps } = actionAndWatchStatusToIconProps(
        watchStatus.code
      );

      return (
        <EuiToolTip content={nodeText}>
          <EuiBadge
            data-test-subj={`sgTableCol-Status-${watchId}`}
            iconType={iconType}
            {...iconProps}
          >
            {watchStatus.code}
          </EuiBadge>
        </EuiToolTip>
      );
    }

    return (
      <div>
        {actions.map((action, key) => {
          const { nodeText, ...iconProps } = actionAndWatchStatusToIconProps(action.status.code);

          return (
            <EuiFlexGroup key={key}>
              <EuiFlexItem grow={false}>
                <EuiToolTip content={nodeText}>
                  <EuiIcon data-test-subj={`sgTableCol-Status-${action.name}`} {...iconProps} />
                </EuiToolTip>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>{action.name}</EuiFlexItem>
            </EuiFlexGroup>
          );
        })}
      </div>
    );
  };

  renderSearchFilterOptions = (values = []) =>
    values.map(status => {
      const { color } = actionAndWatchStatusToIconProps(status);
      return {
        value: status,
        view: <EuiHealth color={color}>{status}</EuiHealth>,
      };
    });

  render() {
    const { alerts, error, isLoading } = this.state;
    const { history, location } = this.props;

    const { watchId: encodedWatchId, dateGte, dateLt, refreshInterval, isPaused } = defaults(
      queryString.parse(location.search),
      DEFAULT_URL_PARAMS
    );

    const watchId = !encodedWatchId ? undefined : decodeURI(encodedWatchId);
    const isAlertsAggByWatch = !!watchId;

    const selection = {
      selectable: doc => doc._id,
      onSelectionChange: tableSelection => this.setState({ tableSelection }),
    };

    const sorting = {
      sort: {
        field: TABLE_SORT_FIELD,
        direction: TABLE_SORT_DIRECTION,
      },
    };

    const actions = [
      {
        render: ({ _id: id, _index: index }) => (
          <TableDeleteAction name={id} onClick={() => this.handleDeleteAlerts([{ id, index }])} />
        ),
      },
    ];

    const columns = [
      {
        field: '_id',
        name: 'Id',
        footer: 'Id',
        truncateText: true,
        alignment: LEFT_ALIGNMENT,
        render: (id, alert) => (
          <TableIdCell
            name={id}
            value={id}
            onClick={() => {
              this.context.triggerInspectJsonFlyout({
                json: alert,
                title: id,
              });
            }}
          />
        ),
      },
      {
        field: DEFAULT_DATEFIELD,
        name: execEndText,
        footer: execEndText,
        sortable: true,
        render: (executionEnd, { _id }) => (
          <TableTextCell
            value={moment(executionEnd).format('MMMM Do YYYY, h:mm:ss a')}
            name={`ExecEnd-${_id}`}
          />
        ),
      },
      {
        field: 'actions',
        name: statusText,
        footer: statusText,
        render: this.renderActionsColumns,
      },
    ];

    const contentPanelActions = [
      <DatePicker
        start={dateGte}
        end={dateLt}
        refreshInterval={+refreshInterval}
        isPaused={isPaused === 'true'}
        onChange={this.handleDatePickerChange}
      />,
    ];

    if (isAlertsAggByWatch) {
      contentPanelActions.unshift(<CancelButton onClick={() => history.push(APP_PATH.WATCHES)} />);
    } else {
      columns.push({
        field: 'watch_id',
        name: 'Watch Id',
        footer: 'Watch Id',
        sortable: true,
        truncateText: true,
        render: (watchId, { _id }) => (
          <TableIdCell
            name={`WatchId-${_id}`}
            value={watchId}
            onClick={() => this.props.history.push(getResourceEditUri(watchId))}
          />
        ),
      });
    }

    columns.push({ actions });

    return (
      <Fragment>
        <ContentPanel
          title={executionHistoryText}
          secondTitle={watchId}
          actions={contentPanelActions}
        >
          {this.renderSearchBar()}
          <EuiSpacer />
          <EuiInMemoryTable
            error={get(error, 'message')}
            items={alerts}
            itemId="_id"
            columns={columns}
            selection={selection}
            sorting={sorting}
            loading={isLoading}
            pagination
            isSelectable
          />
        </ContentPanel>
      </Fragment>
    );
  }
}

Alerts.propTypes = {
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default Alerts;
