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
  TableNameCell,
  TableDeleteAction,
  TableCloneAction,
  TableTextCell,
  TableMultiDeleteButton,
  TableSwitchSystemItems,
  CreateButton,
  CancelButton
} from '../../components';
import { resourcesToUiResources, uiResourceToResource, getResourceEditUri } from './utils';
import { APP_PATH } from '../../utils/constants';
import {
  nameText,
  descriptionText,
  systemItemsText
} from '../../utils/i18n/common';
import {
  tenantsText,
  createTenantText,
  emptyTenantsTableMessageText,
  noTenantsText
} from '../../utils/i18n/tenants';
import { filterReservedStaticTableResources } from '../../utils/helpers';
import { LocalStorageService, TenantsService } from '../../services';

class Tenants extends Component {
  constructor(props) {
    super(props);

    this.backendService = new TenantsService(this.props.httpClient);
    this.localStorage = new LocalStorageService();
    const { isShowingTableSystemItems = false } = this.localStorage.cache[APP_PATH.TENANTS];

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
      this.localStorage.setCacheByPath(APP_PATH.TENANTS, { isShowingTableSystemItems });
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

  render() {
    const { history } = this.props;
    const { isLoading, error, tableResources, isShowingTableSystemItems } = this.state;

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
        field: 'description',
        name: descriptionText,
        footer: descriptionText,
        align: 'left',
        mobileOptions: {
          header: false
        },
        render: (description, { _id }) => (
          <TableTextCell name={`Description-${_id}`} value={description} />
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
        title={tenantsText}
        actions={[
          (<CancelButton onClick={() => history.push(APP_PATH.HOME)} />),
          (<CreateButton
            value={createTenantText}
            onClick={() => history.push(APP_PATH.CREATE_TENANT)}
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

Tenants.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  onTriggerErrorCallout: PropTypes.func.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired
};

export default Tenants;
