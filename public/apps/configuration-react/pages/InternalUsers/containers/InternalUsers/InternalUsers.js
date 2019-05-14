import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  EuiButton,
  EuiInMemoryTable,
  EuiIcon,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiEmptyPrompt,
  EuiFlexGrid,
  EuiConfirmModal,
  EuiOverlayMask,
  EUI_MODAL_CONFIRM_BUTTON
} from '@elastic/eui';
import { get } from 'lodash';
import { ContentPanel, SimpleItemsList } from '../../../../components';
import {
  APP_PATH,
  SESSION_STORAGE,
  INTERNAL_USERS_ACTIONS
} from '../../../../utils/constants';
import {
  createInternalUserText,
  internalUsersText,
  backendRolesText,
  emptyUsersTableMessageText,
  noUsersText
} from '../../../../utils/i18n/internal_users';
import {
  cancelText,
  nameText,
  reservedText,
  deleteText,
  currentUserText,
  doYouReallyWantToDeleteText,
  confirmDeleteText,
  confirmText
} from '../../../../utils/i18n/common';
import { usersToTableUsers, tableUserToUser } from './utils';

const renderResourceNameCell = history => (name, resource) => {
  const { user_name: currentResource } = JSON.parse(sessionStorage.getItem(SESSION_STORAGE.RESTAPIINFO) || '{}');
  return(
    <div>
      <EuiFlexGroup>
        <EuiFlexItem>
          {resource.reserved ? (
            <EuiText size="s">{name}</EuiText>
          ) : (
            <EuiLink
              onClick={() =>
                history.push(`${APP_PATH.CREATE_INTERNAL_USER}?id=${name}&action=${INTERNAL_USERS_ACTIONS.UPDATE_USER}`)
              }
            >
              {name}
            </EuiLink>
          )
          }
        </EuiFlexItem>
      </EuiFlexGroup>
      {name === currentResource && (
        <EuiFlexGrid columns={2} gutterSize="s" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiIcon type="user"/>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size="s">{currentUserText}</EuiText>
          </EuiFlexItem>
        </EuiFlexGrid>
      )}
      {resource.reserved && (
        <EuiFlexGrid columns={2} gutterSize="s" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiIcon type="lock"/>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size="s">{reservedText}</EuiText>
          </EuiFlexItem>
        </EuiFlexGrid>
      )}
    </div>
  );
};

// TODO: make this component get API data by chunks (paginations)
class InternalUsers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      resources: [],
      error: null,
      isLoading: true,
      tableSelection: [],
      resourcesToDelete: []
    };

    this.backendService = this.props.internalUsersService;
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      this.setState({ isLoading: true });
      const { data: resources } = await this.backendService.list();
      this.setState({ resources: usersToTableUsers(resources), error: null });
    } catch(error) {
      this.setState({ error });
      this.props.onTriggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
  }

  handleDeleteResources = resourcesToDelete => this.setState({ resourcesToDelete })

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
    this.handleDeleteResources([]);
    this.fetchData();
  }

  cloneResource = async resource => {
    let { id: username } = resource;
    username += '_copy';
    try {
      this.setState({ isLoading: true });
      const doPreSaveResourceAdaptation = false;
      await this.backendService.save(username, tableUserToUser(resource), doPreSaveResourceAdaptation);
    } catch(error) {
      this.setState({ error });
      this.props.onTriggerErrorCallout(error);
    }
    this.setState({ isLoading: false });
    this.fetchData();
  }

  renderCreateResourceButton = history => (
    <EuiButton
      onClick={() => history.push(APP_PATH.CREATE_INTERNAL_USER)}
    >
      {createInternalUserText}
    </EuiButton>
  )

  renderCancelButton = history => (
    <EuiButton
      onClick={() => history.push(APP_PATH.HOME)}
    >
      {cancelText}
    </EuiButton>
  )

  renderToolsLeft = () => {
    const tableSelection = this.state.tableSelection;

    if (tableSelection.length === 0) {
      return;
    }

    const handleMultiDelete = () => {
      this.handleDeleteResources(tableSelection.map(item => item.id));
      this.setState({ tableSelection: [] });
    };

    const multiDeleteButton = (
      <EuiButton
        color="danger"
        iconType="trash"
        onClick={handleMultiDelete}
      >
        {deleteText} {tableSelection.length}
      </EuiButton>
    );

    return multiDeleteButton;
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

  renderConfirmResourcesDeleteModal = resourcesToDelete => (
    <EuiOverlayMask>
      <EuiConfirmModal
        title={confirmDeleteText}
        onCancel={() => this.handleDeleteResources([])}
        onConfirm={() => this.deleteResources(resourcesToDelete)}
        cancelButtonText={cancelText}
        confirmButtonText={confirmText}
        buttonColor="danger"
        defaultFocusedButton={EUI_MODAL_CONFIRM_BUTTON}
      >
        <p>{doYouReallyWantToDeleteText} {resourcesToDelete.join(', ')}?</p>
      </EuiConfirmModal>
    </EuiOverlayMask>
  )

  render() {
    const { history } = this.props;
    const { isLoading, error, resources, resourcesToDelete } = this.state;
    const isDeleting = !!resourcesToDelete.length;

    const actions = [
      {
        name: 'Clone',
        description: 'Clone this user',
        icon: 'copy',
        type: 'icon',
        onClick: this.cloneResource
      }, {
        name: 'Delete',
        enabled: resource => !resource.reserved,
        description: 'Delete this resource',
        icon: 'trash',
        type: 'icon',
        color: 'danger',
        onClick: resource => this.handleDeleteResources([resource.id])
      }
    ];

    const columns = [
      {
        field: 'id',
        name: nameText,
        footer: nameText,
        align: 'left',
        sortable: true,
        mobileOptions: {
          header: false
        },
        render: renderResourceNameCell(history)
      },
      {
        field: 'backend_roles',
        name: backendRolesText,
        footer: backendRolesText,
        align: 'left',
        mobileOptions: {
          header: false
        },
        render: items => (<SimpleItemsList items={items} />)
      },
      {
        align: 'right',
        actions
      }
    ];

    const selection = {
      selectable: resource => resource.id && !resource.reserved,
      onSelectionChange: tableSelection => this.setState({ tableSelection })
    };

    const search = {
      toolsLeft: this.renderToolsLeft(),
      box: {
        incremental: true,
      }
    };

    return (
      <ContentPanel
        title={internalUsersText}
        actions={[
          this.renderCancelButton(history),
          this.renderCreateResourceButton(history)
        ]}
      >
        <EuiInMemoryTable
          items={resources}
          itemId="id"
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

        {isDeleting && this.renderConfirmResourcesDeleteModal(resourcesToDelete)}
      </ContentPanel>
    );
  }
}

InternalUsers.propTypes = {
  history: PropTypes.object.isRequired,
  httpClient: PropTypes.func,
  internalUsersService: PropTypes.object.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired
};

export default InternalUsers;
