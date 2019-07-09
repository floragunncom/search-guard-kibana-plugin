import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  EuiButton,
  EuiInMemoryTable,
  EuiIcon,
  EuiText,
  EuiFlexItem,
  EuiEmptyPrompt,
  EuiFlexGrid
} from '@elastic/eui';
import { get } from 'lodash';
import {
  ContentPanel,
  TableItemsListCell,
  TableNameCell,
  TableDeleteAction,
  TableCloneAction,
  TableMultiDeleteButton,
  TableSwitchSystemItems
} from '../../components';
import {
  CreateButton,
  CancelButton
} from '../../components/ContentPanel/components';
import {
  APP_PATH,
  INTERNAL_USERS_ACTIONS
} from '../../utils/constants';
import {
  createInternalUserText,
  internalUsersText,
  backendRolesText,
  emptyUsersTableMessageText,
  noUsersText
} from '../../utils/i18n/internal_users';
import {
  nameText,
  currentUserText,
  systemItemsText
} from '../../utils/i18n/common';
import { resourcesToUiResources, uiResourceToResource } from './utils';
import { SessionStorageService, LocalStorageService } from '../../services';
import { filterReservedStaticTableResources } from '../../utils/helpers';

// TODO: make this component get API data by chunks (paginations)
class InternalUsers extends Component {
  constructor(props) {
    super(props);

    this.localStorage = new LocalStorageService();
    this.backendService = this.props.internalUsersService;
    const { isShowingTableSystemItems } = this.localStorage.cache[APP_PATH.INTERNAL_USERS];

    this.state = {
      resources: [],
      error: null,
      isLoading: true,
      tableSelection: [],
      isShowingTableSystemItems
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillUpdate(nextProps, nextState) {
    const { isShowingTableSystemItems } = nextState;
    if (isShowingTableSystemItems !== this.state.isShowingTableSystemItems) {
      this.localStorage.setCacheByPath(APP_PATH.INTERNAL_USERS, { isShowingTableSystemItems });
    }
  }

  fetchData = async () => {
    try {
      this.setState({ isLoading: true });
      const { data: resources } = await this.backendService.list();
      this.setState({ resources: resourcesToUiResources(resources), error: null });
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
    let { _id: username } = resource;
    username += '_copy';
    try {
      this.setState({ isLoading: true });
      const doPreSave = false;
      await this.backendService.save(username, uiResourceToResource(resource), doPreSave);
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
      title={<h3>{noUsersText}</h3>}
      titleSize="xs"
      body={emptyUsersTableMessageText}
      actions={(
        <EuiButton
          onClick={() => history.push(APP_PATH.CREATE_INTERNAL_USER)}
        >
          {createInternalUserText}
        </EuiButton>
      )}
    />
  )

  renderActiveUser = name => {
    const { user_name: currentResource } = SessionStorageService.restApiInfo();
    return (
      name === currentResource && (
        <EuiFlexGrid
          columns={2}
          gutterSize="s"
          responsive={false}
          data-test-subj={`sgTableCol-Name-${name}-CurrentUser`}
        >
          <EuiFlexItem grow={false}>
            <EuiIcon type="user"/>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size="s">{currentUserText}</EuiText>
          </EuiFlexItem>
        </EuiFlexGrid>
      )
    );
  }

  render() {
    const { history } = this.props;
    const { isLoading, error, resources, isShowingTableSystemItems } = this.state;
    const getResourceEditUri = name => `${APP_PATH.CREATE_INTERNAL_USER}?id=${name}&action=${INTERNAL_USERS_ACTIONS.UPDATE_USER}`;

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
            children={this.renderActiveUser(id)}
          />
        )
      },
      {
        field: 'backend_roles',
        name: backendRolesText,
        footer: backendRolesText,
        align: 'left',
        mobileOptions: {
          header: false
        },
        render: (items, { _id }) => (
          <TableItemsListCell items={items} name={`BackendRoles-${_id}`} />
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
            this.setState({ isShowingTableSystemItems: !isShowingTableSystemItems });
          }}
        />
      ),
      box: {
        incremental: true,
      }
    };

    const tableResources = filterReservedStaticTableResources(resources, isShowingTableSystemItems);

    return (
      <ContentPanel
        title={internalUsersText}
        actions={[
          (<CancelButton onClick={() => history.push(APP_PATH.HOME)} />),
          (<CreateButton
            value={createInternalUserText}
            onClick={() => history.push(APP_PATH.CREATE_INTERNAL_USER)}
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

InternalUsers.propTypes = {
  history: PropTypes.object.isRequired,
  httpClient: PropTypes.func,
  internalUsersService: PropTypes.object.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired
};

export default InternalUsers;
