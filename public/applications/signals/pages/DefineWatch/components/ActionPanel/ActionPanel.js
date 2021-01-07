/* eslint-disable @kbn/eslint/require-license-header */
import React, { Component } from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { cloneDeep, isEmpty } from 'lodash';
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
import { actionText } from '../../../../utils/i18n/common';
import {
  watchActionsHelpText,
  watchActionSlackHelpText,
  watchActionIndexHelpText,
  watchActionEmailHelpText,
  watchActionJiraHelpText,
  watchActionPagerdutyHelpText,
  watchActionWebhookHelpText,
} from '../../../../utils/i18n/watch';
import { ACTION_TYPE } from './utils/constants';
import * as ACTION_DEFAULTS from './utils/action_defaults';

import { Context } from '../../../../Context';

const newActions = {
  [ACTION_TYPE.WEBHOOK]: {
    Body: WebhookAction,
    headerProps: {
      description: watchActionWebhookHelpText,
    },
  },
  [ACTION_TYPE.SLACK]: {
    Body: SlackAction,
    headerProps: {
      description: watchActionSlackHelpText,
    },
  },
  [ACTION_TYPE.INDEX]: {
    Body: ElasticsearchAction,
    headerProps: {
      iconType: 'database',
      description: watchActionIndexHelpText,
    },
  },
  [ACTION_TYPE.EMAIL]: {
    Body: EmailAction,
    headerProps: {
      iconType: 'email',
      description: watchActionEmailHelpText,
    },
  },
  [ACTION_TYPE.JIRA]: {
    Body: JiraAction,
    headerProps: {
      description: watchActionJiraHelpText,
    },
  },
  [ACTION_TYPE.PAGERDUTY]: {
    Body: PagerdutyAction,
    headerProps: {
      description: watchActionPagerdutyHelpText,
    },
  },
};

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
    const { arrayHelpers } = this.props;
    this.triggerAddActionPopover();

    const newAction = cloneDeep(ACTION_DEFAULTS[actionType] || ACTION_DEFAULTS[ACTION_TYPE.EMAIL]);
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
      formik: {
        values: { actions },
      },
    } = this.props;

    const hasActions = !isEmpty(actions);
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
            name: 'Jira',
            icon: <EuiIcon type="empty" size="m" />,
            onClick: () => this.addAction(ACTION_TYPE.JIRA),
          },
          {
            name: 'PagerDuty',
            icon: <EuiIcon type="empty" size="m" />,
            onClick: () => this.addAction(ACTION_TYPE.PAGERDUTY),
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
            actionBody={<Body index={index} accounts={accounts} />}
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
        title={actionText}
        description={watchActionsHelpText}
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
};

export default connectFormik(ActionPanel);
