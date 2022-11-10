/* eslint-disable @kbn/eslint/require-license-header */
import React, { Component, Fragment } from 'react';

import queryString from 'query-string';
import {
  EuiSpacer,
  EuiCallOut,
  EuiErrorBoundary,
  EuiButton,
  EuiFormRow,
  EuiText,
} from '@elastic/eui';
import { WatchService } from '../../services';

import { APP_PATH } from '../../utils/constants';

import { Context } from '../../Context';
import { ContentPanel } from '../../components';
import { groupActionsByAckState } from './utils/helpers';

class WatchAck extends Component {
  static contextType = Context;

  constructor(props, context) {
    super(props, context);

    const { match } = this.props;

    const { httpClient } = context;
    this.watchService = new WatchService(httpClient);
    this.initialState = {
      watchId: match.params.watchId,
      // At the moment we only support one action passed through the url
      selectiveActions: match.params.actionId ? [match.params.actionId] : [],
      missingSelectiveActions: [],
      /**
       * Is the watch (state) still loading?
       */
      isLoading: true,
      /**
       * While waiting for the acknowledge response
       */
      isAcknowledging: false,
      didAcknowledge: false,

      watchState: null,
      actionsAcked: null,
      actionsNotAcked: null,
      actionsNotAcknowledgeable: null,
    };

    this.state = this.initialState;
  }

  setInitialState() {
    const { match } = this.props;

    this.setState({
      ...this.initialState,
      watchId: match.params.watchId,
      // At the moment we only support one action passed through the url
      selectiveActions: match.params.actionId ? [match.params.actionId] : [],
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { match } = this.props;
    // Need to detect url changes manually...
    if (
      match.params.watchId !== prevProps.match.params.watchId ||
      match.params.actionId !== prevProps.match.params.actionId
    ) {
      this.setInitialState();
      this.fetchData();
    }
  }

  componentDidMount() {
    this.fetchData().then(async () => {
      const { one_click: oneClick } = queryString.parse(this.props.location.search);
      // If we have no ackable actions, onAcknowledge will do nothing
      if (oneClick && oneClick === 'true') {
        await this.onAcknowledge();
      }
    });
  }

  fetchData = async () => {
    const { history, match } = this.props;

    const watchId = match.params.watchId;

    if (!watchId) return;

    try {
      const [watchResponse, stateResponse] = await Promise.all([
        this.watchService.get(watchId),
        this.watchService.state(watchId),
      ]);

      const watch = watchResponse.resp;
      const watchState = stateResponse.resp;
      console.debug('WatchAck --fetchData -- state', watchState);
      // Group actions, taking the actions query parameter into account
      const actionsByAckState = groupActionsByAckState(
        watchState.actions,
        this.state.selectiveActions,
        watch.actions
      );

      let missingSelectiveActions = [];

      if (this.state.selectiveActions) {
        // Check if all selective actions exist
        missingSelectiveActions = this.state.selectiveActions.filter((actionId) => {
          if (!watchState.actions[actionId]) {
            return true;
          }

          return false;
        });
      }

      this.setState({
        watchState: watchState,
        missingSelectiveActions,
        actionsAcked: actionsByAckState.acked,
        actionsNotAcked: actionsByAckState.notAcked,
        actionsNotAcknowledgeable: actionsByAckState.notAcknowledgeable,
        isLoading: false,
      });
    } catch (error) {
      console.error('WatchAck -- fetchData', error);
      this.setState({ isLoading: false });

      if (error.body && error.body.statusCode === 404) {
        history.push({ search: '' });
      } else {
        this.context.addErrorToast(error);
      }
    }
  };

  async onAcknowledge() {
    const actionIds = Object.keys(this.state.actionsNotAcked);
    if (actionIds.length === 0) {
      return;
    }

    // We don't want to ack the entire watch if we have selective actions via the query parameter
    const ackFullWatch = actionIds.length > 1 && this.state.selectiveActions.length === 0;
    try {
      // We have a state where the acknowledge button switches to acked
      this.setState({
        isAcknowledging: true,
      });

      if (!ackFullWatch) {
        await this.watchService.ack(this.state.watchId, actionIds[0]);
      } else {
        await this.watchService.ack(this.state.watchId);
      }

      const currentTime = new Date();
      const acknowledgedOn = currentTime.toLocaleString();

      this.setState({
        didAcknowledge: {
          by: 'You',
          on: acknowledgedOn,
        },
      });
    } catch (error) {
      console.warn('Could not acknowledge watch');
    }

    this.setState({
      isAcknowledging: false,
    });
  }

  onCancel = () => {
    this.props.history.push(APP_PATH.WATCHES);
  };

  render() {
    return (
      <EuiErrorBoundary>
        <ContentPanel title={this.state.watchId} horizontalRuleMargin={'s'} showActions={false}>
          {this.state.watchState && this.renderWatchActions()}
          {!this.state.isLoading && !this.state.watchState && this.renderWatchNotFound()}
        </ContentPanel>
      </EuiErrorBoundary>
    );
  }

  renderWatchNotFound() {
    return (
      <EuiFormRow>
        <EuiCallOut color={'danger'} title={'Watch not found'} />
      </EuiFormRow>
    );
  }

  renderWatchActions() {
    const usingSelectiveActions = this.state.selectiveActions.length;

    // If using selective actions, we have another error for missing actions later
    // We show this message even if we have ack_enabled:false actions - those aren't displayed anywhere.
    if (
      !usingSelectiveActions &&
      Object.keys(this.state.actionsNotAcked).length === 0 &&
      Object.keys(this.state.actionsAcked).length === 0
    ) {
      return (
        <div>
          <EuiSpacer size={'m'} />
          <EuiFormRow>
            <EuiCallOut color="warning">No acknowledgeable action</EuiCallOut>
          </EuiFormRow>
        </div>
      );
    }

    return (
      <div>
        <div>
          {this.renderMissingSelectiveActions(this.state.missingSelectiveActions)}
          {this.renderNotAcked(this.state.actionsNotAcked)}
          {this.renderAlreadyAcked(this.state.actionsAcked)}
          <EuiSpacer size={'m'} />
        </div>
      </div>
    );
  }

  renderMissingSelectiveActions(missingSelectiveActions = []) {
    if (missingSelectiveActions.length === 0) {
      return null;
    }

    return (
      <EuiFormRow>
        <EuiCallOut color={'danger'}>{missingSelectiveActions.join(', ')} not found</EuiCallOut>
      </EuiFormRow>
    );
  }

  renderNotAcked(actions = {}) {
    const actionIds = Object.keys(actions);
    if (actionIds.length === 0) {
      return null;
    }

    // If the actions have different last_execution times,
    // we just display the latest one
    let latestLastExecution = null;
    actionIds.forEach((actionId) => {
      const action = actions[actionId];

      if (action.last_execution) {
        const actionLastExecution = new Date(action.last_execution);
        if (latestLastExecution === null || latestLastExecution < actionLastExecution) {
          latestLastExecution = actionLastExecution;
        }
      }
    });

    return (
      <div>
        {this.state.didAcknowledge === false && (
          <Fragment>
            <div>
              <EuiText style={{ fontWeight: 'bold' }} size={'m'}>
                {actionIds.join(', ')}
              </EuiText>
              <EuiSpacer size={'m'} />
              <p>Last execution: {latestLastExecution ? latestLastExecution.toLocaleString() : ''}</p>
              <EuiSpacer size={'m'} />
              <EuiFormRow>
                <EuiButton
                  color={'primary'}
                  disabled={this.state.isAcknowledging}
                  fullWidth
                  fill
                  maxWidth={'16rem'}
                  onClick={() => {
                    this.onAcknowledge();
                  }}
                >
                  {this.state.isAcknowledging ? 'Acknowleding...' : 'Acknowledge'}
                </EuiButton>
              </EuiFormRow>
            </div>
            <EuiSpacer size={'l'} />
          </Fragment>
        )}

        {this.state.didAcknowledge !== false && (
          <Fragment>
            <div>
              <EuiFormRow>
                <EuiCallOut color={'success'} title={'Acknowledged'}>
                  <div>
                    <EuiText style={{ fontWeight: 'bold' }} size={'m'}>
                      {actionIds.join(', ')}
                    </EuiText>
                    <EuiSpacer size={'m'} />
                    Acknowledged on {this.state.didAcknowledge.on} by {this.state.didAcknowledge.by}
                  </div>
                </EuiCallOut>
              </EuiFormRow>
              <EuiSpacer size={'m'} />
            </div>
          </Fragment>
        )}
      </div>
    );
  }

  renderAlreadyAcked(ackedActions) {
    const actionIds = Object.keys(ackedActions);
    if (actionIds.length === 0) {
      return null;
    }

    const users = [];

    // If the actions have different last_execution times,
    // we just display the latest one
    let latestAck = null;
    actionIds.forEach((actionId) => {
      const action = ackedActions[actionId];

      if (action.acked?.on) {
        const actionAckedOn = new Date(action.acked.on);
        if (users.indexOf(action.acked.by) === -1) {
          users.push(action.acked.by);
        }
        if (latestAck === null || latestAck < actionAckedOn) {
          latestAck = actionAckedOn;
        }
      }
    });

    return (
      <div>
        <Fragment>
          <EuiFormRow>
            <EuiCallOut color={'warning'} title={'Already acknowledged'}>
              <div>
                <EuiText style={{ fontWeight: 'bold' }} size={'m'}>
                  {actionIds.join(', ')}
                </EuiText>
                <EuiSpacer size={'m'} />
                Acknowledged on {latestAck.toLocaleString()} by {users.join(', ')}
              </div>
            </EuiCallOut>
          </EuiFormRow>
          <EuiSpacer size={'l'} />
        </Fragment>
      </div>
    );
  }
}

export default WatchAck;