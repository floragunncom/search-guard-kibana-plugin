/*
 * Copyright 2015-2019 _floragunn_ GmbH
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import { connect as connectFormik, ArrayHelpers } from 'formik';
import { connect as connectRedux } from 'react-redux';
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
  EmailAction,
} from '../Actions';
import { DestinationsService } from '../../../../services';
import { addErrorToast } from '../../../../redux/actions';
import { actionText } from '../../../../utils/i18n/common';
import { ACTION_TYPE } from './utils/constants';
import * as ACTION_DEFAULTS from './utils/action_defaults';

const newActions = {
  [ACTION_TYPE.WEBHOOK]: {
    Body: WebhookAction,
    headerProps: {
      iconType: 'logoWebhook',
      description: 'Sends HTTP request',
    },
  },
  [ACTION_TYPE.SLACK]: {
    Body: SlackAction,
    headerProps: {
      iconType: 'logoSlack',
      description: 'Sends message on Slack',
    },
  },
  [ACTION_TYPE.INDEX]: {
    Body: ElasticsearchAction,
    headerProps: {
      iconType: 'logoElasticsearch',
      description: 'Puts data to index',
    },
  },
  [ACTION_TYPE.EMAIL]: {
    Body: EmailAction,
    headerProps: {
      iconType: 'logoGmail',
      description: 'Sends email',
    },
  },
};

interface ActionPanelProps {
  dispatch: Function;
  httpClient: Function;
  arrayHelpers: ArrayHelpers;
  formik: object;
  onComboBoxOnBlur: Function;
  onComboBoxCreateOption: Funciton;
  onComboBoxChange: Fucntion;
  onTriggerConfirmDeletionModal: Funciton;
}

interface ActionPanelState {
  isAddActionPopoverOpen: boolean;
  isLoading: boolean;
  destinations: object[];
}

class ActionPanel extends Component<ActionPanelProps, ActionPanelState> {
  constructor(props: ActionPanelProps) {
    super(props);

    this.state = {
      isAddActionPopoverOpen: false,
      isLoading: true,
      destinations: [],
    };

    this.destService = new DestinationsService(this.props.httpClient);
  }

  componentDidMount() {
    this.getDestinations();
  }

  getDestinations = async () => {
    const { dispatch } = this.props;
    this.setState({ isLoading: true });
    try {
      const { resp: destinations } = await this.destService.get();
      this.setState({ destinations });
    } catch (error) {
      console.error('ActionPanel -- getDestinations', error);
      dispatch(addErrorToast(error));
    }
    this.setState({ isLoading: false });
  };

  triggerAddActionPopover = () => {
    this.setState(prevState => ({
      isAddActionPopoverOpen: !prevState.isAddActionPopoverOpen,
    }));
  };

  addAction = (actionType: string) => {
    const { arrayHelpers } = this.props;
    this.triggerAddActionPopover();
    arrayHelpers.unshift(
      cloneDeep(ACTION_DEFAULTS[actionType] || ACTION_DEFAULTS[ACTION_TYPE.EMAIL])
    );
  };

  deleteAction = (actionIndex: number, actionName: string, arrayHelpers: object) => {
    const { onTriggerConfirmDeletionModal } = this.props;
    onTriggerConfirmDeletionModal({
      body: actionName,
      onConfirm: () => {
        arrayHelpers.remove(actionIndex);
        onTriggerConfirmDeletionModal(null);
      },
    });
  };

  render() {
    const {
      httpClient,
      arrayHelpers,
      formik: {
        values: { actions },
      },
      onComboBoxChange,
      onComboBoxOnBlur,
      onComboBoxCreateOption,
    } = this.props;

    const hasActions = !isEmpty(actions);
    const { isAddActionPopoverOpen, isLoading, destinations } = this.state;

    const addActionContextMenuPanels = [
      {
        id: 0,
        title: 'Destinations',
        items: [
          {
            name: 'Email',
            icon: <EuiIcon type="logoGmail" size="m" />,
            onClick: () => this.addAction(ACTION_TYPE.EMAIL),
          },
          {
            name: 'Slack',
            icon: <EuiIcon type="logoSlack" size="m" />,
            onClick: () => this.addAction(ACTION_TYPE.SLACK),
          },
          {
            name: 'Webhook',
            icon: <EuiIcon type="logoWebhook" size="m" />,
            onClick: () => this.addAction(ACTION_TYPE.WEBHOOK),
          },
          {
            name: 'Elasticsearch',
            icon: <EuiIcon type="logoElasticsearch" size="m" />,
            onClick: () => this.addAction(ACTION_TYPE.INDEX),
          },
          {
            name: 'PagerDuty (comming soon)',
            icon: <EuiIcon type="empty" size="m" />,
            onClick: () => null,
          },
        ],
      },
    ];

    return (
      <ContentPanel
        title={actionText}
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
        <div style={{ paddingLeft: '10px' }}>
          {hasActions
            ? actions.map((action, index) => {
                const { Body, headerProps } = newActions[action.type];
                return (
                  <Action
                    name={action.name}
                    key={index}
                    id={index.toString(2)}
                    actionHeader={<Header actionName={action.name} {...headerProps} />}
                    actionBody={
                      <Body
                        index={index}
                        destinations={destinations}
                        httpClient={httpClient}
                        arrayHelpers={arrayHelpers}
                        onComboBoxChange={onComboBoxChange}
                        onComboBoxOnBlur={onComboBoxOnBlur}
                        onComboBoxCreateOption={onComboBoxCreateOption}
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
              })
            : null}
        </div>
      </ContentPanel>
    );
  }
}

export default connectRedux()(connectFormik(ActionPanel));
