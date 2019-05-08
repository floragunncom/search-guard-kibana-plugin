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
import { APP_PATH, CALLOUTS, SESSION_STORAGE } from '../../../../utils/constants';
import {
  i18nCreateInternalUserText,
  i18nCancelText,
  i18nInternalUsersText,
  i18nNameText,
  i18nReservedText,
  i18nBackendRolesText,
  i18nDeleteText,
  i18nEmptyUsersTableMessage,
  i18nCurrentUserText,
  i18nDoYouReallyWantToDeleteText,
  i18nConfirmDeleteText,
  i18nConfirmText,
  i18nNoUsersText
} from '../../../../utils/i18n_nodes';
import { usersToTableUsers, tableUserToUser } from './utils';

const renderResourceNameCell = history => (name, resource) => {
  const { username: currentResource } = JSON.parse(sessionStorage.getItem(SESSION_STORAGE.SG_USER));
  return(
    <div>
      <EuiFlexGroup>
        <EuiFlexItem>
          {resource.reserved ? (
            <EuiText size="s">{name}</EuiText>
          ) : (
            <EuiLink
              onClick={() =>
                history.push(`${APP_PATH.CREATE_INTERNAL_USER}?id=${name}`)
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
            <EuiText size="s">{i18nCurrentUserText}</EuiText>
          </EuiFlexItem>
        </EuiFlexGrid>
      )}
      {resource.reserved && (
        <EuiFlexGrid columns={2} gutterSize="s" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiIcon type="lock"/>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size="s">{i18nReservedText}</EuiText>
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
      this.handleTriggerCallout(error);
    }
    this.setState({ isLoading: false });
  }

  handleTriggerCallout = error => {
    error = error.data || error;
    this.setState({ error });
    this.props.onTriggerCallout({
      type: CALLOUTS.ERROR_CALLOUT,
      payload: get(error, 'message')
    });
  }

  handleDeleteResources = resourcesToDelete => this.setState({ resourcesToDelete })

  deleteResources = async resourceIds => {
    try {
      this.setState({ isLoading: true });
      for (let i = 0; i < resourceIds.length; i++) {
        await this.backendService.delete(resourceIds[i]);
      }
    } catch(error) {
      this.handleTriggerCallout(error);
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
      this.handleTriggerCallout(error);
    }
    this.setState({ isLoading: false });
    this.fetchData();
  }

  renderCreateResourceButton = history => (
    <EuiButton
      onClick={() => history.push(APP_PATH.CREATE_INTERNAL_USER)}
    >
      {i18nCreateInternalUserText}
    </EuiButton>
  )

  renderCancelButton = history => (
    <EuiButton
      onClick={() => history.push(APP_PATH.HOME)}
    >
      {i18nCancelText}
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
        {i18nDeleteText} {tableSelection.length}
      </EuiButton>
    );

    return multiDeleteButton;
  }

  renderEmptyTableMessage = history => (
    <EuiEmptyPrompt
      title={<h3>{i18nNoUsersText}</h3>}
      titleSize="xs"
      body={i18nEmptyUsersTableMessage}
      actions={(
        <EuiButton
          onClick={() => history.push(APP_PATH.CREATE_INTERNAL_USER)}
        >
          {i18nCreateInternalUserText}
        </EuiButton>
      )}
    />
  )

  renderConfirmResourcesDeleteModal = resourcesToDelete => (
    <EuiOverlayMask>
      <EuiConfirmModal
        title={i18nConfirmDeleteText}
        onCancel={() => this.handleDeleteResources([])}
        onConfirm={() => this.deleteResources(resourcesToDelete)}
        cancelButtonText={i18nCancelText}
        confirmButtonText={i18nConfirmText}
        buttonColor="danger"
        defaultFocusedButton={EUI_MODAL_CONFIRM_BUTTON}
      >
        <p>{i18nDoYouReallyWantToDeleteText} {resourcesToDelete.join(', ')}?</p>
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
        name: i18nNameText,
        footer: i18nNameText,
        align: 'left',
        sortable: true,
        mobileOptions: {
          header: false
        },
        render: renderResourceNameCell(history)
      },
      {
        field: 'backend_roles',
        name: i18nBackendRolesText,
        footer: i18nBackendRolesText,
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
      selectable: resource => resource.id,
      onSelectionChange: (tableSelection) => this.setState({ tableSelection })
    };

    const search = {
      toolsLeft: this.renderToolsLeft(),
      box: {
        incremental: true,
      }
    };

    return (
      <ContentPanel
        title={i18nInternalUsersText}
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
  onTriggerCallout: PropTypes.func.isRequired
};

export default InternalUsers;
