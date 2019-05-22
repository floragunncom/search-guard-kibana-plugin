import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  EuiButton,
  EuiInMemoryTable,
  EuiEmptyPrompt,
  EuiConfirmModal,
  EuiOverlayMask,
  EUI_MODAL_CONFIRM_BUTTON
} from '@elastic/eui';
import { get } from 'lodash';
import { ContentPanel, SimpleItemsList, NameCell } from '../../components';
import { resourcesToUiResources, uiResourceToResource } from './utils';
import { APP_PATH, ROLES_ACTIONS } from '../../utils/constants';
import {
  cancelText,
  deleteText,
  confirmDeleteText,
  confirmText,
  doYouReallyWantToDeleteText,
  nameText
} from '../../utils/i18n/common';
import {
  rolesText,
  createRoleText,
  emptyRolesTableMessageText,
  clusterPermissionsText,
  indexPatternsText,
  tenantPatternsText
} from '../../utils/i18n/roles';

class Roles extends Component {
  constructor(props) {
    super(props);

    this.state = {
      resources: [],
      error: null,
      isLoading: true,
      tableSelection: [],
      resourcesToDelete: []
    };

    this.backendService = this.props.rolesService;
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    this.setState({ isLoading: true });
    try {
      const { data: resources } = await this.backendService.list();
      this.setState({ resources: resourcesToUiResources(resources), error: null });
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

  renderCreateRoleButton = history => (
    <EuiButton
      onClick={() => history.push(APP_PATH.CREATE_ROLE)}
    >
      {createRoleText}
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
      this.handleDeleteResources(tableSelection.map(item => item._id));
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
    const getResourceEditUri = name => `${APP_PATH.CREATE_ROLE}?id=${name}&action=${ROLES_ACTIONS.UPDATE_ROLE}`;

    const actions = [
      {
        name: 'Clone',
        description: 'Clone this role',
        icon: 'copy',
        type: 'icon',
        onClick: this.cloneResource
      }, {
        name: 'Delete',
        enabled: resource => !resource.reserved,
        description: 'Delete this role',
        icon: 'trash',
        type: 'icon',
        color: 'danger',
        onClick: resource => this.handleDeleteResources([resource._id])
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
        render: (id, resource) => (
          <NameCell
            history={history}
            uri={getResourceEditUri(id)}
            name={id}
            resource={resource}
          />
        )
      },
      {
        field: '_clusterPermissions',
        name: clusterPermissionsText,
        footer: clusterPermissionsText,
        align: 'left',
        mobileOptions: {
          header: false
        },
        render: items => (<SimpleItemsList items={items} />)
      },
      {
        field: '_indexPatterns',
        name: indexPatternsText,
        footer: indexPatternsText,
        align: 'left',
        mobileOptions: {
          header: false
        },
        render: items => (<SimpleItemsList items={items} />)
      },
      {
        field: '_tenantPatterns',
        name: tenantPatternsText,
        footer: tenantPatternsText,
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
      selectable: resource => resource._id && !resource.reserved,
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
        title={rolesText}
        actions={[
          this.renderCancelButton(history),
          this.renderCreateRoleButton(history)
        ]}
      >
        <EuiInMemoryTable
          items={resources}
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

        {isDeleting && this.renderConfirmResourcesDeleteModal(resourcesToDelete)}
      </ContentPanel>
    );
  }
}

Roles.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  rolesService: PropTypes.object.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired
};

export default Roles;
