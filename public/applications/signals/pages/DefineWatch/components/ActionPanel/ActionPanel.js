/* eslint-disable @kbn/eslint/require-license-header */
import React, { Component } from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { cloneDeep, isEmpty, get } from 'lodash';
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
  JiraAction,
  PagerdutyAction,
} from '../Actions';
import { AccountsService } from '../../../../services';
import { resolveActionText } from '../../../../utils/i18n/watch';
import { actionText } from '../../../../utils/i18n/common';
import { ACTION_TYPE } from './utils/constants';
import * as ACTION_DEFAULTS from './utils/action_defaults';
import { Context } from '../../../../Context';

const newActions = {
  [ACTION_TYPE.WEBHOOK]: {
    Body: WebhookAction,
    headerProps: {
      description: 'Sends HTTP request',
    },
  },
  [ACTION_TYPE.SLACK]: {
    Body: SlackAction,
    headerProps: {
      description: 'Sends message on Slack',
    },
  },
  [ACTION_TYPE.INDEX]: {
    Body: ElasticsearchAction,
    headerProps: {
      iconType: 'database',
      description: 'Puts data to index',
    },
  },
  [ACTION_TYPE.EMAIL]: {
    Body: EmailAction,
    headerProps: {
      iconType: 'email',
      description: 'Sends email',
    },
  },
  [ACTION_TYPE.JIRA]: {
    Body: JiraAction,
    headerProps: {
      description: 'Creates Jira issue',
    },
  },
  [ACTION_TYPE.PAGERDUTY]: {
    Body: PagerdutyAction,
    headerProps: {
      description: 'Creates PagerDuty event',
    },
  },
};

function actionToResolveAction(action) {
  const rAction = { ...action };
  rAction.resolves_severity = [];
  delete rAction.throttle_period;
  delete rAction.severity;
  return rAction;
}

class ActionPanel extends Component {
  static contextType = Context;

  constructor(props, context) {
    super(props, context);

    this.state = {
      isAddActionPopoverOpen: false,
      isLoading: true,
      accounts: [],
    };

    this.destService = new AccountsService(context.httpClient);
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
    this.setState((prevState) => ({ isAddActionPopoverOpen: !prevState.isAddActionPopoverOpen }));
  };

  addAction = (actionType) => {
    const { arrayHelpers, isResolveActions } = this.props;

    this.triggerAddActionPopover();
    let newAction = cloneDeep(ACTION_DEFAULTS[actionType] || ACTION_DEFAULTS[ACTION_TYPE.EMAIL]);
    if (isResolveActions) newAction = actionToResolveAction(newAction);

    arrayHelpers.unshift(newAction);
  };

  deleteAction = (actionIndex, actionName, arrayHelpers) => {
    const { triggerConfirmDeletionModal } = this.context;
    triggerConfirmDeletionModal({
      body: actionName,
      onConfirm: () => {
        arrayHelpers.remove(actionIndex);
        triggerConfirmDeletionModal(null);
      },
    });
  };

  render() {
    const {
      arrayHelpers,
      formik: { values },
      isResolveActions,
    } = this.props;

    const actions = isResolveActions ? values.resolve_actions : values.actions;
    const titleText = isResolveActions ? resolveActionText : actionText;
    const hasActions = !isEmpty(actions);
    const { isAddActionPopoverOpen, isLoading, accounts } = this.state;

    const addActionContextMenuPanels = [
      {
        id: 0,
        title: 'Actions',
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
            name: 'Jira',
            icon: <EuiIcon type="empty" size="m" />,
            onClick: () => this.addAction(ACTION_TYPE.JIRA),
          },
          {
            name: 'PagerDuty',
            icon: <EuiIcon type="empty" size="m" />,
            onClick: () => this.addAction(ACTION_TYPE.PAGERDUTY),
          },
          {
            name: 'Elasticsearch',
            icon: <EuiIcon type="database" size="m" />,
            onClick: () => this.addAction(ACTION_TYPE.INDEX),
          },
        ],
      },
    ];

    const renderActions = () =>
      actions.map((action, index) => {
        const { Body, headerProps } = newActions[action.type];

        return (
          <Action
            name={action.name}
            key={index}
            id={index.toString(2)}
            actionHeader={<Header actionName={action.name} {...headerProps} />}
            actionBody={
              <Body
                isResolveActions={isResolveActions}
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

    return (
      <ContentPanel
        title={titleText}
        titleSize="s"
        bodyStyles={{ padding: 'initial', paddingLeft: '10px' }}
        panelDivProps={{
          id: isResolveActions ? 'sg.signals.actions.resolve' : 'sg.signals.actions',
        }}
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
          <div style={{ paddingLeft: '10px' }}>{hasActions ? renderActions() : null}</div>
        </EuiErrorBoundary>
      </ContentPanel>
    );
  }
}

ActionPanel.propTypes = {
  isLoading: PropTypes.bool,
  arrayHelpers: PropTypes.object.isRequired,
  formik: PropTypes.object.isRequired,
  isResolveActions: PropTypes.bool,
};

export default connectFormik(ActionPanel);
