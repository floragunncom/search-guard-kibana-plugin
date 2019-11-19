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
  TABLE_SORT_DIRECTION,
  DATE_PICKER,
} from './utils/constants';
import { DEFAULT_DATEFIELD } from '../../../../../utils/signals/constants';

class Alerts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alerts: [],
      isLoading: true,
      error: null,
      tableSelection: [],
    };

    this.alertService = new AlertService(this.props.httpClient);
  }

  componentDidMount() {
    const urlParams = queryString.parse(this.props.location.search);

    this.setUrlParameters(urlParams);
    if (urlParams.dateGte && urlParams.dateLt) {
      this.getAlerts(urlParams);
    }
  }

  componentDidUpdate({ location: prevLocation },) {
    const prevUrlParams = queryString.parse(prevLocation.search);
    const urlParams = queryString.parse(this.props.location.search);

    if (JSON.stringify(urlParams) !== JSON.stringify(prevUrlParams)) {
      this.getAlerts(urlParams);
    }
  }

  componentWillUnmount() {
    this.props.onTriggerInspectJsonFlyout(null);
  }

  setUrlParameters = ({
    dateGte = DEFAULT_DATEFIELD_RANGE_QUERY_GTE,
    dateLt = DEFAULT_DATEFIELD_RANGE_QUERY_LT,
    refreshInterval = DATE_PICKER.REFRESH_INTERVAL,
    isPaused = DATE_PICKER.IS_PAUSED,
  } = {}) => {
    const { location, history } = this.props;

    const currParams = queryString.parse(location.search);
    const newParams = queryString.parse(queryString.stringify({
      dateGte,
      dateLt,
      refreshInterval,
      isPaused,
    }));

    if (JSON.stringify(newParams) !== JSON.stringify(currParams)) {
      history.push({
        search: queryString.stringify(Object.assign(currParams, newParams))
      });
    } else { // Get the fresh alerts anyways
      const { watchId } = queryString.parse(this.props.location.search);
      this.getAlerts({ dateGte, dateLt, watchId });
    }
  }

  getAlerts = async ({ dateGte, dateLt, watchId }) => {
    this.setState({ isLoading: true });

    try {
      const { resp: alerts } = await this.alertService.get({ dateGte, dateLt, watchId });
      this.setState({ alerts });
    } catch (error) {
      console.error('Alerts -- getAlerts', error);
      this.setState({ error });
      this.props.dispatch(addErrorToast(error));
      console.debug('Alerts -- params', { dateGte, dateLt, watchId });
    }

    this.setState({ isLoading: false });
  }

  deleteAlerts = async (alerts = []) => {
    const { dispatch, location } = this.props;
    const promises = [];
    this.setState({ isLoading: true });

    alerts.forEach(({ id, index }) => {
      const promise = this.alertService.delete({ id, index })
        .then(() => {
          dispatch(addSuccessToast((<p>{deleteText} {id}</p>)));
        })
        .catch(error => {
          console.error('Alerts -- deleteAlert', error);
          dispatch(addErrorToast(error));
        });
      promises.push(promise);
    });

    await Promise.all(promises);
    this.setState({ isLoading: false });

    const urlParams = queryString.parse(location.search);
    this.getAlerts(urlParams);
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
    const { alerts, error, isLoading } = this.state;
    const { history, location } = this.props;
    const {
      watchId: encodedWatchId,
      dateGte = DEFAULT_DATEFIELD_RANGE_QUERY_GTE,
      dateLt = DEFAULT_DATEFIELD_RANGE_QUERY_LT,
      refreshInterval = DATE_PICKER.REFRESH_INTERVAL,
      isPaused = DATE_PICKER.IS_PAUSED,
    } = queryString.parse(location.search);

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
        field: DEFAULT_DATEFIELD,
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
      <DatePicker
        start={dateGte}
        end={dateLt}
        refreshInterval={+refreshInterval}
        isPaused={isPaused === 'true'}
        onChange={({
          start: dateGte,
          end: dateLt,
          refreshInterval,
          isPaused = true,
        }) => {
          this.setUrlParameters({ dateGte, dateLt, refreshInterval, isPaused });
        }}
      />
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
