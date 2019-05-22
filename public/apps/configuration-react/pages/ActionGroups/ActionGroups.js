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
import { APP_PATH, ACTION_GROUPS_ACTIONS } from '../../utils/constants';
import {
  cancelText,
  deleteText,
  confirmDeleteText,
  confirmText,
  doYouReallyWantToDeleteText,
  nameText
} from '../../utils/i18n/common';
import {
  actionGroupsText,
  permissionsText,
  createActionGroupText,
  emptyActionGroupsTableMessageText,
  noActionGroupsText
} from '../../utils/i18n/action_groups';

class ActionGroups extends Component {
  constructor(props) {
    super(props);

    this.state = {
      resources: [],
      error: null,
      isLoading: true,
      tableSelection: [],
      resourcesToDelete: []
    };

    this.backendService = this.props.actionGroupsService;
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

  renderCreateResourceButton = history => (
    <EuiButton
      onClick={() => history.push(APP_PATH.CREATE_ACTION_GROUP)}
    >
      {createActionGroupText}
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
      title={<h3>{noActionGroupsText}</h3>}
      titleSize="xs"
      body={emptyActionGroupsTableMessageText}
      actions={(
        <EuiButton
          onClick={() => history.push(APP_PATH.CREATE_ACTION_GROUP)}
        >
          {createActionGroupText}
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
    const getResourceEditUri = name => `${APP_PATH.CREATE_ACTION_GROUP}?id=${name}&action=${ACTION_GROUPS_ACTIONS.UPDATE_ACTION_GROUP}`;

    const actions = [
      {
        name: 'Clone',
        description: 'Clone this action group',
        icon: 'copy',
        type: 'icon',
        onClick: this.cloneResource
      }, {
        name: 'Delete',
        enabled: resource => !resource.reserved,
        description: 'Delete this action group',
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
        field: 'permissions',
        name: permissionsText,
        footer: permissionsText,
        align: 'left',
        mobileOptions: {
          header: false
        },
        render: items => (<SimpleItemsList items={items} />)
      },
      {
        field: 'actiongroups',
        name: actionGroupsText,
        footer: actionGroupsText,
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
        title={actionGroupsText}
        actions={[
          this.renderCancelButton(history),
          this.renderCreateResourceButton(history)
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

ActionGroups.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  actionGroupsService: PropTypes.object.isRequired,
};

export default ActionGroups;
