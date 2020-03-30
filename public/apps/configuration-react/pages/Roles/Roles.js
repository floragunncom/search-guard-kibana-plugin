import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  EuiButton,
  EuiInMemoryTable,
  EuiEmptyPrompt
} from '@elastic/eui';
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
  CancelButton
} from '../../components';
import { resourcesToUiResources, uiResourceToResource } from './utils';
import { APP_PATH, ROLES_ACTIONS } from '../../utils/constants';
import {
  nameText,
  systemItemsText
} from '../../utils/i18n/common';
import {
  rolesText,
  createRoleText,
  emptyRolesTableMessageText,
  clusterPermissionsText,
  indexPatternsText,
  tenantPatternsText
} from '../../utils/i18n/roles';
import { filterReservedStaticTableResources } from '../../utils/helpers';
import { LocalStorageService, RolesService } from '../../services';

class Roles extends Component {
  constructor(props) {
    super(props);

    this.backendService = new RolesService(this.props.httpClient);
    this.localStorage = new LocalStorageService();
    const { isShowingTableSystemItems = false } = this.localStorage.cache[APP_PATH.ROLES];

    this.state = {
      resources: [],
      tableResources: [],
      error: null,
      isLoading: true,
      tableSelection: [],
      isShowingTableSystemItems
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState) {
    const { prevIsShowingTableSystemItems } = prevState;
    const { isShowingTableSystemItems } = this.state;
    if (prevIsShowingTableSystemItems !== isShowingTableSystemItems) {
      this.localStorage.setCacheByPath(APP_PATH.ROLES, { isShowingTableSystemItems });
    }
  }

  fetchData = async () => {
    this.setState({ isLoading: true });
    try {
      const { data } = await this.backendService.list();
      const resources = resourcesToUiResources(data);
      const tableResources = filterReservedStaticTableResources(resources, this.state.isShowingTableSystemItems);
      this.setState({ resources, tableResources, error: null });
    } catch(error) {
      this.setState({ error });
      this.props.onTriggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  }

  handleDeleteResources = resourcesToDelete => {
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
      }
    });
  }

  deleteResources = async resourceIds => {
    try {
      this.setState({ isLoading: true });
      for (let i = 0; i < resourceIds.length; i++) {
        await this.backendService.delete(resourceIds[i]);
      }
    } catch(error) {
      this.setState({ error });
      this.props.onTriggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
    this.fetchData();
  }

  cloneResource = async resource => {
    let { _id: name } = resource;
    name += '_copy';
    try {
      this.setState({ isLoading: true });
      await this.backendService.save(name, uiResourceToResource(resource));
    } catch(error) {
      this.setState({ error });
      this.props.onTriggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
    this.fetchData();
  }

  renderToolsLeft = () => {
    const tableSelection = this.state.tableSelection;

    if (tableSelection.length === 0) {
      return;
    }

    const handleMultiDelete = () => {
      this.handleDeleteResources(tableSelection.map(item => item._id));
      this.setState({ tableSelection: [] });
    };

    return (
      <TableMultiDeleteButton
        onClick={handleMultiDelete}
        numOfSelections={tableSelection.length}
      />
    );
  }

  renderEmptyTableMessage = history => (
    <EuiEmptyPrompt
      title={<h3>{rolesText}</h3>}
      titleSize="xs"
      body={emptyRolesTableMessageText}
      actions={(
        <EuiButton
          onClick={() => history.push(APP_PATH.CREATE_ROLE)}
        >
          {createRoleText}
        </EuiButton>
      )}
    />
  )

  render() {
    const { history } = this.props;
    const { isLoading, error, tableResources, isShowingTableSystemItems } = this.state;
    const getResourceEditUri = name => `${APP_PATH.CREATE_ROLE}?id=${name}&action=${ROLES_ACTIONS.UPDATE_ROLE}`;

    const actions = [
      {
        render: (resource) => (
          <TableCloneAction
            name={resource._id}
            onClick={() => this.cloneResource(resource)}
          />
        )
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
        }
      }
    ];

    const columns = [
      {
        field: '_id',
        name: nameText,
        footer: nameText,
        align: 'left',
        sortable: true,
        mobileOptions: {
          header: false
        },
        render: (id, { reserved }) => (
          <TableNameCell
            history={history}
            uri={getResourceEditUri(id)}
            name={id}
            isReserved={reserved}
          />
        )
      },
      {
        field: 'cluster_permissions',
        name: clusterPermissionsText,
        footer: clusterPermissionsText,
        align: 'left',
        mobileOptions: {
          header: false
        },
        render: (items, { _id }) => (
          <TableItemsListCell name={`ClusterPermissions-${_id}`} items={items} />
        )
      },
      {
        field: '_indexPatterns',
        name: indexPatternsText,
        footer: indexPatternsText,
        align: 'left',
        mobileOptions: {
          header: false
        },
        render: (items, { _id }) => (
          <TableItemsListCell name={`IndexPatterns-${_id}`} items={items} />
        )
      },
      {
        field: '_tenantPatterns',
        name: tenantPatternsText,
        footer: tenantPatternsText,
        align: 'left',
        mobileOptions: {
          header: false
        },
        render: (items, { _id }) => (
          <TableItemsListCell name={`TenantPatterns-${_id}`} items={items} />
        )
      },
      {
        align: 'right',
        actions
      }
    ];

    const selection = {
      selectable: resource => resource._id && !resource.reserved,
      onSelectionChange: tableSelection => this.setState({ tableSelection })
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
              tableResources: filterReservedStaticTableResources(this.state.resources, !isShowingTableSystemItems)
            });
          }}
        />
      ),
      box: {
        incremental: true,
      }
    };

    return (
      <ContentPanel
        title={rolesText}
        actions={[
          (<CancelButton onClick={() => history.push(APP_PATH.HOME)} />),
          (<CreateButton
            value={createRoleText}
            onClick={() => history.push(APP_PATH.CREATE_ROLE)}
          />)
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

Roles.propTypes = {
  httpClient: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired
};

export default Roles;
