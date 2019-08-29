import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { LEFT_ALIGNMENT } from '@elastic/eui/lib/services';
import { EuiInMemoryTable, EuiBadge } from '@elastic/eui';
import { get } from 'lodash';
import moment from 'moment';
import { AlertService } from '../../services';
import {
  DatePicker,
  ContentPanel,
  TableMultiDeleteButton,
  TableDeleteAction,
  TableIdCell,
  TableTextCell,
  CancelButton
} from '../../components';
import { addSuccessToast, addErrorToast } from '../../redux/actions';
import {
  execEndText,
  statusText,
  executionHistoryText
} from '../../utils/i18n/watch';
import { deleteText } from '../../utils/i18n/common';
import {
  APP_PATH,
  DEFAULT_DATEFIELD_RANGE_QUERY_GTE,
  DEFAULT_DATEFIELD_RANGE_QUERY_LT
} from '../../utils/constants';
import {
  ALERT_STATUS,
  TABLE_SORT_FIELD,
  TABLE_SORT_DIRECTION
} from './utils/constants';

class Alerts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alerts: [],
      isLoading: true,
      error: null,
      tableSelection: [],
      date: {
        start: DEFAULT_DATEFIELD_RANGE_QUERY_GTE,
        end: DEFAULT_DATEFIELD_RANGE_QUERY_LT
      }
    };

    this.alertService = new AlertService(this.props.httpClient);
  }

  componentDidMount() {
    this.getAlerts();
  }

  componentWillUnmount() {
    this.props.onTriggerInspectJsonFlyout(null);
  }

  getAlerts = async ({
    start = this.state.date.start,
    end = this.state.date.end
  } = {}) => {
    this.setState({ isLoading: true });

    try {
      const { watchId: encodedWatchId } = queryString.parse(this.props.location.search);
      const watchId = !encodedWatchId ? undefined : decodeURI(encodedWatchId);

      const { resp: alerts } = await this.alertService.get({
        dateGte: start,
        dateLt: end,
        watchId
      });

      this.setState({ alerts, date: { start, end } });
    } catch (error) {
      this.setState({ error });
      this.props.dispatch(addErrorToast(error));
      console.error('Alerts - getAlerts', error);
    }

    this.setState({ isLoading: false });
  }

  deleteAlerts = async (alerts = []) => {
    const { dispatch } = this.props;
    const promises = [];
    this.setState({ isLoading: true });

    alerts.forEach(({ id, index }) => {
      const promise = this.alertService.delete({ id, index })
        .then(() => {
          dispatch(addSuccessToast((<p>{deleteText} {id}</p>)));
        })
        .catch(error => {
          dispatch(addErrorToast(error));
          console.error('Alerts - deleteAlert', error);
        });
      promises.push(promise);
    });

    await Promise.all(promises);
    this.setState({ isLoading: false });
    this.getAlerts();
  }

  handleDeleteAlerts = (alerts = []) => {
    const { onTriggerConfirmDeletionModal } = this.props;
    onTriggerConfirmDeletionModal({
      body: alerts.map(({ id }) => id).join(', '),
      onConfirm: () => {
        this.deleteAlerts(alerts);
        onTriggerConfirmDeletionModal(null);
      },
      onCancel: () => {
        this.setState({ tableSelection: [] });
        onTriggerConfirmDeletionModal(null);
      }
    });
  }

  renderToolsLeft = () => {
    const { tableSelection, isLoading } = this.state;
    if (tableSelection.length === 0) return null;

    const handleMultiDelete = () => {
      this.handleDeleteAlerts(tableSelection.map(item => ({ id: item._id, index: item._index })));
      this.setState({ tableSelection: [] });
    };

    return (
      <TableMultiDeleteButton
        isLoading={isLoading}
        onClick={handleMultiDelete}
        numOfSelections={tableSelection.length}
      />
    );
  }

  render() {
    const { alerts, date, error, isLoading } = this.state;
    const { history, location } = this.props;
    const { watchId: encodedWatchId } = queryString.parse(location.search);
    const watchId = !encodedWatchId ? undefined : decodeURI(encodedWatchId);
    const isAlertsAggByWatch = !!watchId;

    const search = {
      toolsLeft: this.renderToolsLeft(),
      box: {
        incremental: true,
      }
    };

    if (alerts.length) {
      search.filters = [
        {
          type: 'field_value_selection',
          field: 'status.code',
          name: 'Status',
          multiSelect: 'or',
          options: Object.keys(ALERT_STATUS).map(value => ({ value }))
        }
      ];
    }

    const selection = {
      selectable: doc => doc._id,
      onSelectionChange: tableSelection => this.setState({ tableSelection })
    };

    const sorting = {
      sort: {
        field: TABLE_SORT_FIELD,
        direction: TABLE_SORT_DIRECTION
      }
    };

    const actions = [
      {
        render: ({ _id: id, _index: index }) => (
          <TableDeleteAction
            name={id}
            onClick={() => this.handleDeleteAlerts([{ id, index }])}
          />
        )
      }
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
              this.props.onTriggerInspectJsonFlyout({
                json: alert,
                title: id
              });
            }}
          />
        )
      },
      {
        field: 'execution_end',
        name: execEndText,
        footer: execEndText,
        sortable: true,
        render: (executionEnd, { _id }) => (
          <TableTextCell
            value={moment(executionEnd).format('MMMM Do YYYY, h:mm:ss a')}
            name={`ExecEnd-${_id}`}
          />
        )
      },
      {
        field: 'status.code',
        name: statusText,
        footer: statusText,
        render: (statusCode, { _id }) => {
          const { color = 'warning', iconType = 'alert' } = ALERT_STATUS[statusCode] || {};
          return (
            <EuiBadge
              color={color}
              iconType={iconType}
              data-test-subj={`sgTableCol-Status-${_id}`}
            >
              {statusCode}
            </EuiBadge>
          );
        }
      }
    ];

    const contentPanelActions = [
      (<DatePicker start={date.start} end={date.end} fetchDocs={this.getAlerts} />)
    ];

    if (isAlertsAggByWatch) {
      contentPanelActions.unshift(
        (<CancelButton onClick={() => history.push(APP_PATH.WATCHES)} />)
      );
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
            onClick={() => this.props.history.push(`${APP_PATH.DEFINE_WATCH}?id=${watchId}`)}
          />
        )
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
          <EuiInMemoryTable
            error={get(error, 'message')}
            items={alerts}
            itemId="_id"
            columns={columns}
            search={search}
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
  httpClient: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  onTriggerInspectJsonFlyout: PropTypes.func.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired
};

export default connect()(Alerts);
