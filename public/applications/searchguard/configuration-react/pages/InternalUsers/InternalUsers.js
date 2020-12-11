/*
 *    Copyright 2020 floragunn GmbH
 *
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
import PropTypes from 'prop-types';
import {
  EuiButton,
  EuiInMemoryTable,
  EuiIcon,
  EuiText,
  EuiFlexItem,
  EuiEmptyPrompt,
  EuiFlexGrid,
} from '@elastic/eui';
import { get } from 'lodash';
import {
  ContentPanel,
  TableItemToListCell,
  TableNameCell,
  TableDeleteAction,
  TableCloneAction,
  TableMultiDeleteButton,
  TableSwitchSystemItems,
  CreateButton,
  CancelButton,
} from '../../components';
import { APP_PATH } from '../../utils/constants';
import {
  createInternalUserText,
  internalUsersText,
  searchGuardRolesText,
  backendRolesText,
  emptyUsersTableMessageText,
  noUsersText,
} from '../../utils/i18n/internal_users';
import { nameText, currentUserText, systemItemsText } from '../../utils/i18n/common';
import { resourcesToUiResources, uiResourceToResource, getResourceEditUri } from './utils';
import { LocalStorageService, InternalUsersService } from '../../services';
import { filterReservedStaticTableResources } from '../../utils/helpers';

import { Context } from '../../Context';

class InternalUsers extends Component {
  static contextType = Context;

  constructor(props, context) {
    super(props, context);

    this.configService = this.context.configService;
    this.localStorage = new LocalStorageService();
    this.backendService = new InternalUsersService(this.props.httpClient);
    const { isShowingTableSystemItems = false } = this.localStorage.cache[APP_PATH.INTERNAL_USERS];

    this.state = {
      resources: [],
      tableResources: [],
      error: null,
      isLoading: true,
      tableSelection: [],
      isShowingTableSystemItems,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState) {
    const { prevIsShowingTableSystemItems } = prevState;
    const { isShowingTableSystemItems } = this.state;
    if (prevIsShowingTableSystemItems !== isShowingTableSystemItems) {
      this.localStorage.setCacheByPath(APP_PATH.INTERNAL_USERS, { isShowingTableSystemItems });
    }
  }

  fetchData = async () => {
    try {
      this.setState({ isLoading: true });
      const { data } = await this.backendService.list();
      const resources = resourcesToUiResources(data);
      const tableResources = filterReservedStaticTableResources(
        resources,
        this.state.isShowingTableSystemItems
      );
      this.setState({ resources, tableResources, error: null });
    } catch (error) {
      this.setState({ error });
      this.props.onTriggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  };

  handleDeleteResources = (resourcesToDelete) => {
    const { onTriggerConfirmDeletionModal } = this.props;
    onTriggerConfirmDeletionModal({
      body: resourcesToDelete.join(', '),
      onConfirm: () => {
        this.deleteResources(resourcesToDelete);
        onTriggerConfirmDeletionModal(null);
      },
      onCancel: () => {
        this.setState({ tableSelection: [] });
        onTriggerConfirmDeletionModal(null);
      },
    });
  };

  deleteResources = async (resourceIds) => {
    try {
      this.setState({ isLoading: true });
      for (let i = 0; i < resourceIds.length; i++) {
        await this.backendService.delete(resourceIds[i]);
      }
    } catch (error) {
      this.setState({ error });
      this.props.onTriggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
    this.fetchData();
  };

  cloneResource = async (resource) => {
    let { _id: username } = resource;
    username += '_copy';
    try {
      this.setState({ isLoading: true });
      await this.backendService.save(username, uiResourceToResource(resource));
    } catch (error) {
      this.setState({ error });
      this.props.onTriggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
    this.fetchData();
  };

  renderToolsLeft = () => {
    const tableSelection = this.state.tableSelection;

    if (tableSelection.length === 0) {
      return;
    }

    const handleMultiDelete = () => {
      this.handleDeleteResources(tableSelection.map((item) => item._id));
      this.setState({ tableSelection: [] });
    };

    return (
      <TableMultiDeleteButton onClick={handleMultiDelete} numOfSelections={tableSelection.length} />
    );
  };

  renderEmptyTableMessage = (history) => (
    <EuiEmptyPrompt
      title={<h3>{noUsersText}</h3>}
      titleSize="xs"
      body={emptyUsersTableMessageText}
      actions={
        <EuiButton onClick={() => history.push(APP_PATH.CREATE_INTERNAL_USER)}>
          {createInternalUserText}
        </EuiButton>
      }
    />
  );

  renderActiveUser = (name) => {
    const currentResource = this.configService.get('restapiinfo.user_name');
    return (
      name === currentResource && (
        <EuiFlexGrid
          columns={2}
          gutterSize="s"
          responsive={false}
          data-test-subj={`sgTableCol-Name-${name}-CurrentUser`}
        >
          <EuiFlexItem grow={false}>
            <EuiIcon type="user" />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size="s">{currentUserText}</EuiText>
          </EuiFlexItem>
        </EuiFlexGrid>
      )
    );
  };

  render() {
    const { history } = this.props;
    const { isLoading, error, tableResources, isShowingTableSystemItems } = this.state;

    const actions = [
      {
        render: (resource) => (
          <TableCloneAction name={resource._id} onClick={() => this.cloneResource(resource)} />
        ),
      },
      {
        render: ({ _id, reserved }) => {
          return (
            <TableDeleteAction
              isDisabled={reserved}
              name={_id}
              onClick={() => this.handleDeleteResources([_id])}
            />
          );
        },
      },
    ];

    const columns = [
      {
        field: '_id',
        name: nameText,
        footer: nameText,
        align: 'left',
        sortable: true,
        render: (id, { reserved }) => (
          <TableNameCell
            history={history}
            uri={getResourceEditUri(id)}
            name={id}
            isReserved={reserved}
            children={this.renderActiveUser(id)}
          />
        ),
      },
      {
        width: '30%',
        field: '_searchGuardRoles',
        name: searchGuardRolesText,
        footer: searchGuardRolesText,
        align: 'left',
        render: (item, { _id }) => (
          <TableItemToListCell item={item} name={`SearchGuardRoles-${_id}`} />
        ),
      },
      {
        width: '30%',
        field: '_backendRoles',
        name: backendRolesText,
        footer: backendRolesText,
        align: 'left',
        render: (item, { _id }) => <TableItemToListCell item={item} name={`BackendRoles-${_id}`} />,
      },
      {
        align: 'right',
        actions,
      },
    ];

    const selection = {
      selectable: (resource) => resource._id && !resource.reserved,
      onSelectionChange: (tableSelection) => this.setState({ tableSelection }),
    };

    const search = {
      toolsLeft: this.renderToolsLeft(),
      toolsRight: (
        <TableSwitchSystemItems
          label={systemItemsText}
          isChecked={isShowingTableSystemItems}
          onChange={() => {
            this.setState({
              isShowingTableSystemItems: !isShowingTableSystemItems,
              tableResources: filterReservedStaticTableResources(
                this.state.resources,
                !isShowingTableSystemItems
              ),
            });
          }}
        />
      ),
      box: {
        incremental: true,
      },
    };

    return (
      <ContentPanel
        title={internalUsersText}
        actions={[
          <CancelButton onClick={() => history.push(APP_PATH.HOME)} />,
          <CreateButton
            value={createInternalUserText}
            onClick={() => history.push(APP_PATH.CREATE_INTERNAL_USER)}
          />,
        ]}
      >
        <EuiInMemoryTable
          items={tableResources}
          itemId="_id"
          error={get(error, 'message')}
          message={this.renderEmptyTableMessage(history)}
          loading={isLoading}
          columns={columns}
          search={search}
          pagination={true}
          sorting={true}
          selection={selection}
          isSelectable={true}
        />
      </ContentPanel>
    );
  }
}

InternalUsers.propTypes = {
  history: PropTypes.object.isRequired,
  httpClient: PropTypes.object,
  onTriggerErrorCallout: PropTypes.func.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired,
};

export default InternalUsers;
