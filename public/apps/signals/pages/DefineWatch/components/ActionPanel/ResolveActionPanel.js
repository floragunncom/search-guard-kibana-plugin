/* eslint-disable @kbn/eslint/require-license-header */
import React, { Component } from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { get, cloneDeep, isEmpty } from 'lodash';
import { EuiIcon, EuiErrorBoundary } from '@elastic/eui';
import { ContentPanel, PopoverButton } from '../../../../components';
import {
  Action,
  Header,
  WebhookAction,
  SlackAction,
  DeleteActionButton,
  ElasticsearchAction,
  EmailAction,
} from '../Actions';
import { AccountsService } from '../../../../services';
import { resolveActionText } from '../../../../utils/i18n/watch';
import { ACTION_TYPE } from './utils/constants';
import { webhook, slack, index, email } from './utils/action_defaults';

import { Context } from '../../../../Context';

const ACTION_DEFAULTS = { webhook, slack, index, email };

// TODO: This component duplicates code of ActionPanel.
// Have a single unified component instead.
class ResolveActionPanel extends Component {
  static contextType = Context;

  constructor(props) {
    super(props);

    this.state = {
      isAddActionPopoverOpen: false,
      isLoading: true,
      accounts: [],
    };

    this.destService = new AccountsService(this.props.httpClient);
  }

  componentDidMount() {
    this.getAccounts();
  }

  getAccounts = async () => {
    this.setState({ isLoading: true });
    try {
      const { resp: accounts } = await this.destService.search();
      this.setState({ accounts });
    } catch (error) {
      console.error('ActionPanel -- getAccounts', error);
      this.context.addErrorToast(error);
    }
    this.setState({ isLoading: false });
  };

  triggerAddActionPopover = () => {
    this.setState((prevState) => ({
      isAddActionPopoverOpen: !prevState.isAddActionPopoverOpen,
    }));
  };

  addAction = (actionType) => {
    const { arrayHelpers } = this.props;
    this.triggerAddActionPopover();

    const newAction = cloneDeep(ACTION_DEFAULTS[actionType] || ACTION_DEFAULTS[ACTION_TYPE.EMAIL]);
    newAction.resolves_severity = [];
    delete newAction.throttle_period;
    delete newAction.severity;

    arrayHelpers.unshift(newAction);
  };

  deleteAction = (actionIndex, actionName, arrayHelpers) => {
    const { onTriggerConfirmDeletionModal } = this.props;
    onTriggerConfirmDeletionModal({
      body: actionName,
      onConfirm: () => {
        arrayHelpers.remove(actionIndex);
        onTriggerConfirmDeletionModal(null);
      },
    });
  };

  renderActions = (actions, accounts, arrayHelpers) => {
    return isEmpty(actions)
      ? null
      : actions.map((action, index) => {
          let ActionBody = null;
          let headerProps = {};
          switch (action.type) {
            case ACTION_TYPE.EMAIL:
              ActionBody = EmailAction;
              headerProps = {
                iconType: 'email',
                description: 'Sends email',
              };
              break;
            case ACTION_TYPE.WEBHOOK:
              ActionBody = WebhookAction;
              headerProps = {
                description: 'Sends HTTP request',
              };
              break;
            case ACTION_TYPE.SLACK:
              ActionBody = SlackAction;
              headerProps = {
                description: 'Sends message on Slack',
              };
              break;
            case ACTION_TYPE.INDEX:
              ActionBody = ElasticsearchAction;
              headerProps = {
                iconType: 'database',
                description: 'Puts data to a Elasticsearch index',
              };
              break;
          }

          return !ActionBody ? null : (
            <Action
              name={action.name}
              key={index}
              id={index.toString(2)}
              actionHeader={<Header actionName={action.name} {...headerProps} />}
              actionBody={
                <ActionBody
                  isResolveActions
                  index={index}
                  accounts={accounts}
                  arrayHelpers={arrayHelpers}
                />
              }
              deleteButton={
                <DeleteActionButton
                  name={action.name}
                  onDeleteAction={() => this.deleteAction(index, action.name, arrayHelpers)}
                />
              }
            />
          );
        });
  };

  render() {
    const {
      arrayHelpers,
      formik: { values },
    } = this.props;

    const actions = get(values, 'resolve_actions', []);
    const { isAddActionPopoverOpen, isLoading, accounts } = this.state;

    const addActionContextMenuPanels = [
      {
        id: 0,
        title: 'Accounts',
        items: [
          {
            name: 'Email',
            icon: <EuiIcon type="email" size="m" />,
            onClick: () => this.addAction(ACTION_TYPE.EMAIL),
          },
          {
            name: 'Slack',
            icon: <EuiIcon type="empty" size="m" />,
            onClick: () => this.addAction(ACTION_TYPE.SLACK),
          },
          {
            name: 'Webhook',
            icon: <EuiIcon type="empty" size="m" />,
            onClick: () => this.addAction(ACTION_TYPE.WEBHOOK),
          },
          {
            name: 'Elasticsearch',
            icon: <EuiIcon type="database" size="m" />,
            onClick: () => this.addAction(ACTION_TYPE.INDEX),
          },
          {
            name: 'PagerDuty (coming soon)',
            icon: <EuiIcon type="empty" size="m" />,
            onClick: () => null,
          },
        ],
      },
    ];

    return (
      <ContentPanel
        title={resolveActionText}
        titleSize="s"
        bodyStyles={{ padding: 'initial', paddingLeft: '10px' }}
        actions={
          <PopoverButton
            isPopoverOpen={isAddActionPopoverOpen}
            contextMenuPanels={addActionContextMenuPanels}
            onClick={this.triggerAddActionPopover}
            name="AddWatchAction"
            isLoading={isLoading}
          />
        }
      >
        <EuiErrorBoundary>
          <div style={{ paddingLeft: '10px' }}>
            {this.renderActions(actions, accounts, arrayHelpers)}
          </div>
        </EuiErrorBoundary>
      </ContentPanel>
    );
  }
}

ResolveActionPanel.propTypes = {
  httpClient: PropTypes.func.isRequired,
  arrayHelpers: PropTypes.object.isRequired,
  formik: PropTypes.object.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired,
};

export default connectFormik(ResolveActionPanel);
