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
import { EuiButton, EuiInMemoryTable, EuiEmptyPrompt, EuiSpacer, EuiCallOut } from '@elastic/eui';
import { get } from 'lodash';
import {
  ContentPanel,
  TableItemsListCell,
  TableNameCell,
  TableDeleteAction,
  TableCloneAction,
  TableMultiDeleteButton,
  TableSwitchSystemItems,
  CreateButton,
  CancelButton,
} from '../../components';
import { resourcesToUiResources, uiResourceToResource, getResourceEditUri } from './utils';
import { APP_PATH } from '../../utils/constants';
import { nameText, systemItemsText } from '../../utils/i18n/common';
import {
  roleMappingsText,
  createRoleMappingText,
  emptyRoleMappingsTableMessageText,
  noRoleMappingsText,
  noCorrespondingRoleText,
} from '../../utils/i18n/role_mappings';
import { usersText, hostsText, rolesText } from '../../utils/i18n/roles';
import { filterReservedStaticTableResources } from '../../utils/helpers';
import { LocalStorageService, RolesService, RolesMappingService } from '../../services';
import { Context } from '../../Context';

class RoleMappings extends Component {
  static contextType = Context;

  constructor(props, context) {
    super(props, context);

    this.rolesMappingService = new RolesMappingService(context.httpClient);
    this.rolesService = new RolesService(context.httpClient);
    this.localStorage = new LocalStorageService();
    const { isShowingTableSystemItems = false } = this.localStorage.cache[APP_PATH.ROLE_MAPPINGS];

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
      this.localStorage.setCacheByPath(APP_PATH.ROLE_MAPPINGS, { isShowingTableSystemItems });
    }
  }

  fetchData = async () => {
    const { triggerErrorCallout } = this.context;
    this.setState({ isLoading: true });
    try {
      const { data } = await this.rolesMappingService.list();
      const { data: allRoles } = await this.rolesService.list();
      const resources = resourcesToUiResources(data, allRoles);
      const tableResources = filterReservedStaticTableResources(
        resources,
        this.state.isShowingTableSystemItems
      );
      this.setState({ resources, tableResources, error: null });
    } catch (error) {
      this.setState({ error });
      triggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  };

  handleDeleteResources = (resourcesToDelete) => {
    const { triggerConfirmDeletionModal } = this.context;
    triggerConfirmDeletionModal({
      body: resourcesToDelete.join(', '),
      onConfirm: () => {
        this.deleteResources(resourcesToDelete);
        triggerConfirmDeletionModal(null);
      },
      onCancel: () => {
        this.setState({ tableSelection: [] });
        triggerConfirmDeletionModal(null);
      },
    });
  };

  deleteResources = async (resourceIds) => {
    try {
      this.setState({ isLoading: true });
      for (let i = 0; i < resourceIds.length; i++) {
        await this.rolesMappingService.delete(resourceIds[i]);
      }
    } catch (error) {
      this.setState({ error });
      this.context.triggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
    this.fetchData();
  };

  cloneResource = async (resource) => {
    let { _id: name } = resource;
    name += '_copy';
    try {
      this.setState({ isLoading: true });
      await this.rolesMappingService.save(name, uiResourceToResource(resource));
    } catch (error) {
      this.setState({ error });
      this.context.triggerErrorCallout(error);
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
      title={<h3>{noRoleMappingsText}</h3>}
      titleSize="xs"
      body={emptyRoleMappingsTableMessageText}
      actions={
        <EuiButton onClick={() => history.push(APP_PATH.CREATE_ROLE_MAPPING)}>
          {createRoleMappingText}
        </EuiButton>
      }
    />
  );

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

    const missingRoleAlert = ({ _isCorrespondingRole, _id }) =>
      _isCorrespondingRole ? null : (
        <EuiCallOut
          size="s"
          iconType="alert"
          color="danger"
          title={noCorrespondingRoleText}
          data-test-subj={`sgTableCol-Name-${_id}-MissingRole`}
        />
      );

    const columns = [
      {
        field: '_id',
        name: nameText,
        footer: nameText,
        align: 'left',
        sortable: true,
        mobileOptions: {
          header: false,
        },
        render: (id, resource) => (
          <div>
            <TableNameCell
              history={history}
              uri={getResourceEditUri(id)}
              name={id}
              isReserved={resource.reserved}
            />
            <EuiSpacer size="xs" />
            {missingRoleAlert(resource)}
          </div>
        ),
      },
      {
        field: 'users',
        name: usersText,
        footer: usersText,
        align: 'left',
        mobileOptions: {
          header: false,
        },
        render: (items, { _id }) => <TableItemsListCell name={`Users-${_id}`} items={items} />,
      },
      {
        field: 'backend_roles',
        name: rolesText,
        footer: rolesText,
        align: 'left',
        mobileOptions: {
          header: false,
        },
        render: (items, { _id }) => (
          <TableItemsListCell name={`BackendRoles-${_id}`} items={items} />
        ),
      },
      {
        field: 'hosts',
        name: hostsText,
        footer: hostsText,
        align: 'left',
        mobileOptions: {
          header: false,
        },
        render: (items, { _id }) => <TableItemsListCell name={`Hosts-${_id}`} items={items} />,
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
        title={roleMappingsText}
        actions={[
          <CancelButton onClick={() => history.push(APP_PATH.HOME)} />,
          <CreateButton
            value={createRoleMappingText}
            onClick={() => history.push(APP_PATH.CREATE_ROLE_MAPPING)}
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

RoleMappings.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default RoleMappings;
