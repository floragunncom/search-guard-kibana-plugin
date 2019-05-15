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
import { ContentPanel } from '../../components';
import { resourcesToUiResources, uiResourceToResource } from './utils';
import { APP_PATH, TENANTS_ACTIONS } from '../../utils/constants';
import {
  cancelText,
  deleteText,
  confirmDeleteText,
  confirmText,
  doYouReallyWantToDeleteText,
  nameText,
  descriptionText,
  reservedText
} from '../../utils/i18n/common';
import {
  tenantsText,
  createTenantText,
  emptyTenantsTableMessageText,
  noTenantsText
} from '../../utils/i18n/tenants';

const renderResourceNameCell = history => (name, resource) => {
  return(
    <div>
      <EuiFlexGroup>
        <EuiFlexItem>
          {resource.reserved ? (
            <EuiText size="s">{name}</EuiText>
          ) : (
            <EuiLink
              onClick={() =>
                history.push(`${APP_PATH.CREATE_TENANT}?id=${name}&action=${TENANTS_ACTIONS.UPDATE_TENANT}`)
              }
            >
              {name}
            </EuiLink>
          )
          }
        </EuiFlexItem>
      </EuiFlexGroup>
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

class Tenants extends Component {
  constructor(props) {
    super(props);

    this.state = {
      resources: [],
      error: null,
      isLoading: true,
      tableSelection: [],
      resourcesToDelete: []
    };

    this.backendService = this.props.tenantsService;
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
    let { id: name } = resource;
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
      onClick={() => history.push(APP_PATH.CREATE_TENANT)}
    >
      {createTenantText}
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
      title={<h3>{noTenantsText}</h3>}
      titleSize="xs"
      body={emptyTenantsTableMessageText}
      actions={(
        <EuiButton
          onClick={() => history.push(APP_PATH.CREATE_TENANT)}
        >
          {createTenantText}
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
        description: 'Clone this tenant',
        icon: 'copy',
        type: 'icon',
        onClick: this.cloneResource
      }, {
        name: 'Delete',
        enabled: resource => !resource.reserved,
        description: 'Delete this tenant',
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
        field: 'description',
        name: descriptionText,
        footer: descriptionText,
        align: 'left',
        mobileOptions: {
          header: false
        }
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
        title={tenantsText}
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

Tenants.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  tenantsService: PropTypes.object.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired
};

export default Tenants;
