import React, { Component } from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { cloneDeep, isEmpty } from 'lodash';
import { EuiIcon } from '@elastic/eui';
import { ContentPanel, PopoverButton } from '../../../../components';
import {
  Action,
  Header,
  WebhookAction,
  SlackAction,
  DeleteActionButton,
  ElasticsearchAction,
  EmailAction
} from '../Actions';
import { actionText } from '../../../../utils/i18n/common';
import { ACTION_TYPE } from './utils/constants';
import * as ACTION_DEFAULTS from './utils/action_defaults';

const newActions = {
  [ACTION_TYPE.WEBHOOK]: {
    Body: WebhookAction,
    headerProps: {
      iconType: 'logoWebhook',
      description: 'Sends HTTP request'
    }
  },
  [ACTION_TYPE.SLACK]: {
    Body: SlackAction,
    headerProps: {
      iconType: 'logoSlack',
      description: 'Sends message on Slack'
    }
  },
  [ACTION_TYPE.INDEX]: {
    Body: ElasticsearchAction,
    headerProps: {
      iconType: 'logoElasticsearch',
      description: 'Puts data to index'
    }
  },
  [ACTION_TYPE.EMAIL]: {
    Body: EmailAction,
    headerProps: {
      iconType: 'logoGmail',
      description: 'Sends email'
    }
  }
};

class ActionPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAddActionPopoverOpen: false
    };
  }

  triggerAddActionPopover = () => {
    this.setState(prevState => ({
      isAddActionPopoverOpen: !prevState.isAddActionPopoverOpen
    }));
  }

  addAction = actionType => {
    const { arrayHelpers } = this.props;
    this.triggerAddActionPopover();
    arrayHelpers.unshift(
      cloneDeep(ACTION_DEFAULTS[actionType] || ACTION_DEFAULTS[ACTION_TYPE.EMAIL])
    );
  }

  deleteAction = (actionIndex, actionName, arrayHelpers) => {
    const { onTriggerConfirmDeletionModal } = this.props;
    onTriggerConfirmDeletionModal({
      body: actionName,
      onConfirm: () => {
        arrayHelpers.remove(actionIndex);
        onTriggerConfirmDeletionModal(null);
      }
    });
  }

  render() {
    const {
      httpClient,
      arrayHelpers,
      formik: { values: { actions } },
      onComboBoxChange,
      onComboBoxOnBlur,
      onComboBoxCreateOption
    } = this.props;

    const hasActions = !isEmpty(actions);
    const { isAddActionPopoverOpen } = this.state;

    const addActionContextMenuPanels = [
      {
        id: 0,
        title: 'Destinations',
        items: [
          {
            name: 'Email',
            icon: (<EuiIcon type="logoGmail" size="m" />),
            onClick: () => this.addAction(ACTION_TYPE.EMAIL)
          },
          {
            name: 'Slack',
            icon: (<EuiIcon type="logoSlack" size="m" />),
            onClick: () => this.addAction(ACTION_TYPE.SLACK)
          },
          {
            name: 'Webhook',
            icon: (<EuiIcon type="logoWebhook" size="m" />),
            onClick: () => this.addAction(ACTION_TYPE.WEBHOOK)
          },
          {
            name: 'Elasticsearch',
            icon: (<EuiIcon type="logoElasticsearch" size="m" />),
            onClick: () => this.addAction(ACTION_TYPE.INDEX)
          },
          {
            name: 'PagerDuty (comming soon)',
            icon: (<EuiIcon type="empty" size="m" />),
            onClick: () => null
          }
        ]
      }
    ];

    return (
      <ContentPanel
        title={actionText}
        titleSize="s"
        bodyStyles={{ padding: 'initial', paddingLeft: '10px' }}
        actions={(
          <PopoverButton
            isPopoverOpen={isAddActionPopoverOpen}
            contextMenuPanels={addActionContextMenuPanels}
            onClick={this.triggerAddActionPopover}
            name="AddWatchAction"
          />
        )}
      >
        <div style={{ paddingLeft: '10px' }}>
          {hasActions ? (
            actions.map((action, index) => {
              const { Body, headerProps } = newActions[action.type];
              return (
                <Action
                  name={action.name}
                  key={index}
                  id={index.toString(2)}
                  actionHeader={<Header actionName={action.name} {...headerProps} />}
                  actionBody={(
                    <Body
                      index={index}
                      httpClient={httpClient}
                      arrayHelpers={arrayHelpers}
                      onComboBoxChange={onComboBoxChange}
                      onComboBoxOnBlur={onComboBoxOnBlur}
                      onComboBoxCreateOption={onComboBoxCreateOption}
                    />
                  )}
                  deleteButton={
                    <DeleteActionButton
                      name={action.name}
                      onDeleteAction={() => this.deleteAction(index, action.name, arrayHelpers)}
                    />
                  }
                />
              );
            })
          ) : null}
        </div>
      </ContentPanel>
    );
  }
}

ActionPanel.propTypes = {
  httpClient: PropTypes.func.isRequired,
  arrayHelpers: PropTypes.object.isRequired,
  formik: PropTypes.object.isRequired,
  onComboBoxOnBlur: PropTypes.func.isRequired,
  onComboBoxCreateOption: PropTypes.func.isRequired,
  onComboBoxChange: PropTypes.func.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired
};

export default connectFormik(ActionPanel);
