/* eslint-disable @kbn/eslint/require-license-header */
import React, { Component } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiLink,
  EuiIcon,
  EuiButton,
  EuiToolTip,
  EuiTitle,
  EuiText,
  EuiBadge,
  EuiSearchBar,
  EuiSpacer,
} from '@elastic/eui';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { LEFT_ALIGNMENT } from '@elastic/eui/lib/services';
import { WatchService } from '../../services';
import {
  ContentPanel,
  TableInspectAction,
  TableMultiDeleteButton,
  TableIdCell,
  TableTextCell,
  AddButton,
  PopoverButton,
} from '../../components';
import {
  noText,
  yesText,
  deleteText,
  cloneText,
  saveText,
  addExampleText,
  confirmText,
  onText,
  byText,
  unknownText,
} from '../../utils/i18n/common';
import {
  watchToFormik,
  formikToWatch,
  dateFormat,
  actionAndWatchStatusToIconProps,
  getResourceEditUri,
  getResourceReadUri,
  getWatchRelatedAlertsUri,
  isJsonWatch,
} from './utils';
import {
  checksText,
  actionsText,
  isActiveText,
  noActionsText,
  acknowledgeText,
  acknowledgedText,
  acknowledgeActionText,
  executionHistoryText,
  lastStatusText,
  lastExecutionText,
  severityText,
  jsonText,
} from '../../utils/i18n/watch';
import { buildESQuery } from './utils/helpers';
import { APP_PATH, FLYOUTS, WATCH_STATUS } from '../../utils/constants';
import { TABLE_SORT_FIELD, TABLE_SORT_DIRECTION } from './utils/constants';
import { SEVERITY_COLORS } from '../DefineWatch/utils/constants';

import { Context } from '../../Context';

const initialQuery = EuiSearchBar.Query.MATCH_ALL;

class Watches extends Component {
  static contextType = Context;

  constructor(props, context) {
    super(props, context);

    this.state = {
      error: null,
      isLoading: true,
      watches: [],
      tableSelection: [],
      query: initialQuery,
      isNewWatchMenuOpen: false,
    };

    this.watchService = new WatchService(context.httpClient);
  }

  componentDidMount() {
    this.getWatches();
  }

  componentWillUnmount() {
    this.context.closeFlyout();
  }

  componentDidUpdate(prevProps, prevState) {
    const { query: prevQuery } = prevState;
    const { query } = this.state;

    if (JSON.stringify(query) !== JSON.stringify(prevQuery)) {
      this.getWatches();
    }
  }

  triggerNewWatchMenu = () => {
    this.setState((prevState) => ({ isNewWatchMenuOpen: !prevState.isNewWatchMenuOpen }));
  };

  putWatch = async ({ _id, ...watch }) => {
    const watchToSubmit = formikToWatch(watch);

    try {
      this.setState({ isLoading: true });
      await this.watchService.put(watchToSubmit, _id);
      this.context.addSuccessToast(
        <p>
          {saveText} {_id}
        </p>
      );
      this.getWatches();
    } catch (error) {
      console.error('Watches -- putWatches', error);
      this.context.addErrorToast(error);
      this.setState({ error });
      console.debug('Watches -- watch', watchToSubmit);
    }

    this.setState({ isLoading: false });
  };

  fetchWatchesState = async () => {
    const { watches } = this.state;
    const promises = [];

    try {
      watches.forEach((watch, i) => {
        const promise = this.watchService
          .state(watch._id)
          .then(({ resp: state = {} } = {}) => {
            watches[i] = watchToFormik(watch, state);
          })
          .catch(error => {
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

  getWatches = async () => {
    const { query } = this.state;
    this.setState({ isLoading: true, error: null });

    try {
      const esQuery = buildESQuery(EuiSearchBar.Query.toESQuery(query));
      console.debug('Watches -- getWatches -- esQuery', esQuery);

      const { resp: watches } = await this.watchService.search(esQuery);
      this.setState({ watches, error: null });
      this.fetchWatchesState();
      console.debug('Watches -- getWatches', watches);
    } catch (error) {
      console.error('Watches -- getWatches', error);
      this.context.addErrorToast(error);
      this.setState({ error });
    }

    this.setState({ isLoading: false });
    console.debug('Watches -- getWatches -- query', query);
  };

  handleCloneWatch = async ({ _id: id, ...watch }) => {
    const watchToSubmit = formikToWatch(watch);

    try {
      this.setState({ isLoading: true, error: null });
      await this.watchService.put(watchToSubmit, `${id}_copy`);
      this.context.addSuccessToast(
        <p>
          {cloneText} {id}
        </p>
      );
      this.getWatches();
    } catch (error) {
      console.error('Watches -- cloneWatches', error);
      this.context.addErrorToast(error);
      this.setState({ error });
      console.debug('Watches -- watch', watchToSubmit);
    }
    this.setState({ isLoading: false });
  };

  deleteWatches = async (watchIds = []) => {
    const promises = [];

    this.setState({ isLoading: true, error: null });
    watchIds.forEach(id => {
      const promise = this.watchService
        .delete(id)
        .then(() => {
          this.context.addSuccessToast(
            <p>
              {deleteText} {id}
            </p>
          );
        })
        .catch(error => {
          console.error('Watches -- deleteWatches', error);
          this.context.addErrorToast(error);
          this.setState({ error });
          console.debug('Watches -- watchIds', watchIds);
        });
      promises.push(promise);
    });

    await Promise.all(promises);
    this.setState({ isLoading: false });
    this.getWatches();
  };

  handleDeleteWatches = (watches = []) => {
    const { triggerConfirmDeletionModal } = this.context;
    triggerConfirmDeletionModal({
      body: watches.join(', '),
      onConfirm: () => {
        this.deleteWatches(watches);
        triggerConfirmDeletionModal(null);
      },
      onCancel: () => {
        this.setState({ tableSelection: [] });
        triggerConfirmDeletionModal(null);
      },
    });
  };

  handleAck = (watchIds = [], actionId) => {
    const { triggerConfirmModal } = this.context;

    const doAck = async () => {
      this.setState({ isLoading: true });

      try {
        const promises = [];
        watchIds.forEach(id => {
          promises.push(this.watchService.ack(id, actionId));
        });

        await Promise.all(promises);

        watchIds.forEach(id => {
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

    const handleMultiDelete = () => {
      this.handleDeleteWatches(tableSelection.map(item => item._id));
      this.setState({ tableSelection: [] });
    };

    const handleMultiAcknowledge = () => {
      this.handleAck(tableSelection.map(item => item._id));
      this.setState({ tableSelection: [] });
    };

    return (
      <EuiFlexGroup>
        <EuiFlexItem>
          <TableMultiDeleteButton
            onClick={handleMultiDelete}
            numOfSelections={tableSelection.length}
            isLoading={isLoading}
          />
        </EuiFlexItem>
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

  renderActionsColumn = (actions = [], watch) => {
    if (!actions.length) {
      const { nodeText, ...iconProps } = actionAndWatchStatusToIconProps(WATCH_STATUS.NO_ACTION);

      return (
        <div>
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <EuiToolTip content={nodeText}>
                <EuiIcon data-test-subj={`sgTable-Actions-${watch._id}-NoAction`} {...iconProps} />
              </EuiToolTip>
            </EuiFlexItem>
            <EuiFlexItem>{noActionsText}</EuiFlexItem>
          </EuiFlexGroup>
        </div>
      );
    }

    return (
      <div>
        {actions.map((action, key) => {
          const wasAcked = get(watch, `_ui.state.actions[${action.name}].acked`, false);
          const ackedBy = get(watch, `_ui.state.actions[${action.name}].acked.by`, 'admin');
          const ackedOn = get(watch, `_ui.state.actions[${action.name}].acked.on`);

          const ackLinkContent = wasAcked ? (
            <EuiText size="s">
              {acknowledgedText} {byText} {ackedBy} {onText} {dateFormat(ackedOn)}
            </EuiText>
          ) : (
            acknowledgeText
          );

          const ackLink = (
            <EuiFlexGroup key={key}>
              <EuiFlexItem grow={false}>
                <EuiToolTip content={wasAcked ? acknowledgedText : acknowledgeText}>
                  <EuiLink
                    color={wasAcked ? 'subdued' : 'primary'}
                    disabled={wasAcked}
                    onClick={() => this.handleAck([watch._id], action.name)}
                    data-test-subj={`sgTableCol-Actions-ackbtn-${watch._id}-${action.name}`}
                  >
                    {ackLinkContent}
                  </EuiLink>
                </EuiToolTip>
              </EuiFlexItem>
            </EuiFlexGroup>
          );

          const statusCode = get(watch, `_ui.state.actions[${action.name}].last_status.code`);
          const { nodeText, ...iconProps } = actionAndWatchStatusToIconProps(statusCode);

          return (
            <div key={key}>
              <EuiFlexGroup>
                <EuiFlexItem grow={false}>
                  <EuiToolTip content={nodeText}>
                    <EuiIcon
                      data-test-subj={`sgTableCol-Actions-icon-${watch._id}-${action.name}`}
                      {...iconProps}
                    />
                  </EuiToolTip>
                </EuiFlexItem>
                <EuiFlexItem>{action.name}</EuiFlexItem>
              </EuiFlexGroup>
              <EuiFlexGroup>
                <EuiFlexItem>{ackLink}</EuiFlexItem>
              </EuiFlexGroup>
            </div>
          );
        })}
      </div>
    );
  };

  renderLastExecutionColumn = ({ actions = [], _ui = {} } = {}) => {
    if (!actions.length) return null;

    return (
      <div>
        {actions.map((action, key) => {
          let lastExecution = get(_ui, `state.actions[${action.name}].last_execution`);
          lastExecution = !lastExecution ? unknownText : dateFormat(lastExecution);

          return (
            <EuiFlexGroup key={key}>
              <EuiFlexItem>
                <EuiText size="s" grow={false}>
                  <p>{lastExecution}</p>
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          );
        })}
      </div>
    );
  };

  renderExecutionHistoryBtn = ({ _id }) => {
    return (
      <EuiToolTip content={executionHistoryText}>
        <TableInspectAction
          name={_id}
          onClick={() => {
            this.props.history.push(getWatchRelatedAlertsUri(_id));
          }}
        />
      </EuiToolTip>
    );
  };

  renderLastStatusColumn = (field, watch) => {
    const lastStatus = get(watch, '_ui.state.last_status.code');
    const { type: iconType, nodeText, ...badgeProps } = actionAndWatchStatusToIconProps(lastStatus);

    return (
      <EuiToolTip content={nodeText}>
        <EuiBadge iconType={iconType} {...badgeProps}>
          {nodeText}
        </EuiBadge>
      </EuiToolTip>
    );
  };

  renderSeverityColumn = (field, watch) => {
    const severityLevel = get(watch, '_ui.state.last_execution.severity.level', '');
    const severityMappingLevel = get(
      watch,
      '_ui.state.last_execution.severity.mapping_element.level',
      ''
    );
    const level = severityMappingLevel || severityLevel;
    const threshold = get(watch, '_ui.state.last_execution.severity.mapping_element.threshold', '');
    const value = get(watch, '_ui.state.last_execution.severity.value', '');

    let text = '';
    if (level) {
      text += `${level}`;
    }
    if (threshold) {
      text += ` ${Math.floor(threshold)}`;
    }
    if (value) {
      text += ` ${Math.floor(value)}`;
    }

    if (!text) return null;

    let tooltipText = '';
    if (level) {
      tooltipText += ` ${level}`;
    }
    if (threshold) {
      tooltipText += ` threshold=${threshold}`;
    }
    if (value) {
      tooltipText += ` value=${value}`;
    }

    return (
      <EuiToolTip content={tooltipText}>
        <EuiBadge className="sg-watches-severity-col-badge" color={SEVERITY_COLORS[level]}>
          {text}
        </EuiBadge>
      </EuiToolTip>
    );
  };

  handleSearchChange = ({ query, error }) => {
    if (error) {
      this.setState({ error });
    } else {
      this.setState({
        error: null,
        query: query.text ? query : initialQuery,
      });
    }
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
          <EuiSearchBar onChange={this.handleSearchChange} />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  addWatchExample = () => {
    const { triggerFlyout, editorTheme, editorOptions } = this.context;
    const { error, isLoading } = this.state;

    triggerFlyout({
      type: FLYOUTS.WATCHES_HELP,
      payload: {
        onPutWatch: this.putWatch,
        error,
        isLoading,
        editorTheme,
        editorOptions,
      },
    });
  };

  render() {
    const { history } = this.props;
    const { watches, isLoading, error, isNewWatchMenuOpen } = this.state;

    const actions = [
      {
        'data-test-subj': 'sgTableCol-jsonWatch',
        name: jsonText,
        description: 'Watch JSON',
        icon: 'document',
        type: 'icon',
        available: (watch) => !isJsonWatch(watch),
        onClick: (watch) => history.push(getResourceReadUri(watch)),
      },
      {
        'data-test-subj': 'sgTableCol-ActionAcknowledge',
        name: acknowledgeText,
        description: 'Acknowledge the watch',
        icon: 'check',
        type: 'icon',
        color: 'success',
        onClick: watch => this.handleAck([watch._id]),
      },
      {
        'data-test-subj': 'sgTableCol-ActionClone',
        name: cloneText,
        description: 'Clone the watch',
        icon: 'copy',
        type: 'icon',
        onClick: this.handleCloneWatch,
      },
      {
        'data-test-subj': 'sgTableCol-ActionDelete',
        name: deleteText,
        description: 'Delete the watch',
        icon: 'trash',
        type: 'icon',
        color: 'danger',
        onClick: watch => this.handleDeleteWatches([watch._id]),
      },
    ];

    const columns = [
      {
        width: '5%',
        actions: [
          {
            render: this.renderExecutionHistoryBtn,
          },
        ],
      },
      {
        field: '_ui.state.last_status.code',
        name: lastStatusText,
        footer: lastStatusText,
        sortable: true,
        render: this.renderLastStatusColumn,
      },
      {
        field: '_ui.state.last_execution.severity',
        name: severityText,
        footer: severityText,
        sortable: true,
        render: this.renderSeverityColumn,
      },
      {
        field: '_id',
        width: '20%',
        name: 'Id',
        footer: 'Id',
        alignment: LEFT_ALIGNMENT,
        truncateText: true,
        sortable: true,
        render: (id, watch) => (
          <TableIdCell
            name={id}
            value={id}
            onClick={() => history.push(getResourceEditUri(watch))}
          />
        ),
      },
      {
        field: 'active',
        width: '5%',
        name: isActiveText,
        footer: isActiveText,
        render: (active, { _id }) => (
          <TableTextCell value={active ? yesText : noText} name={`Active-${_id}`} />
        ),
      },
      {
        field: 'checks',
        width: '5%',
        name: checksText,
        footer: checksText,
        render: (checks = [], { _id }) => (
          <TableTextCell value={checks.length} name={`NumOfChecks-${_id}`} />
        ),
      },
      {
        width: '20%',
        field: 'actions',
        name: actionsText,
        footer: actionsText,
        render: this.renderActionsColumn,
      },
      {
        name: lastExecutionText,
        footer: lastExecutionText,
        render: this.renderLastExecutionColumn,
      },
      {
        actions,
      },
    ];

    const selection = {
      selectable: doc => doc._id,
      onSelectionChange: tableSelection => {
        this.setState({ tableSelection });
      },
    };

    const sorting = {
      sort: {
        field: TABLE_SORT_FIELD,
        direction: TABLE_SORT_DIRECTION,
      },
    };

    const newWatchMenu = [
      {
        id: 0,
        title: 'Watches',
        items: [
          {
            name: 'Watch',
            onClick: () => {
              history.push(APP_PATH.DEFINE_WATCH);
            },
          },
          {
            name: 'Watch JSON',
            onClick: () => {
              history.push(APP_PATH.DEFINE_JSON_WATCH);
            },
          },
        ],
      },
    ];

    return (
      <ContentPanel
        title="Watches"
        actions={[
          <AddButton value={addExampleText} onClick={this.addWatchExample} />,
          <PopoverButton
            name="newWatch"
            isLoading={isLoading}
            isPopoverOpen={isNewWatchMenuOpen}
            onClick={this.triggerNewWatchMenu}
            contextMenuPanels={newWatchMenu}
          />,
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
              isSelectable
              pagination
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </ContentPanel>
    );
  }
}

Watches.propTypes = {
  history: PropTypes.object.isRequired,
};

export default Watches;
