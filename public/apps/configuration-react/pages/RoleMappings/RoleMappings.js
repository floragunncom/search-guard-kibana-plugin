import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  EuiButton,
  EuiInMemoryTable,
  EuiEmptyPrompt,
  EuiSpacer,
  EuiCallOut
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
  resourcesToUiResources,
  uiResourceToResource
} from './utils';
import { APP_PATH, ROLE_MAPPINGS_ACTIONS } from '../../utils/constants';
import {
  nameText,
  systemItemsText
} from '../../utils/i18n/common';
import {
  roleMappingsText,
  createRoleMappingText,
  emptyRoleMappingsTableMessageText,
  noRoleMappingsText,
  noCorrespondingRoleText
} from '../../utils/i18n/role_mappings';
import {
  usersText,
  hostsText,
  rolesText
} from '../../utils/i18n/roles';
import { filterReservedStaticTableResources } from '../../utils/helpers';
import { LocalStorageService } from '../../services';

class RoleMappings extends Component {
  constructor(props) {
    super(props);

    this.backendService = this.props.roleMappingsService;
    this.localStorage = new LocalStorageService();
    const { isShowingTableSystemItems } = this.localStorage.cache[APP_PATH.ROLE_MAPPINGS];

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
      this.localStorage.setCacheByPath(APP_PATH.ROLE_MAPPINGS, { isShowingTableSystemItems });
    }
  }

  fetchData = async () => {
    const { rolesService, onTriggerErrorCallout } = this.props;
    this.setState({ isLoading: true });
    try {
      const { data: resources } = await this.backendService.list();
      const { data: allRoles } = await rolesService.list();
      this.setState({
        resources: resourcesToUiResources(resources, allRoles),
        error: null
      });
    } catch(error) {
      this.setState({ error });
      onTriggerErrorCallout(error);
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
      const doPreSave = false;
      await this.backendService.save(name, uiResourceToResource(resource), doPreSave);
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
      title={<h3>{noRoleMappingsText}</h3>}
      titleSize="xs"
      body={emptyRoleMappingsTableMessageText}
      actions={(
        <EuiButton
          onClick={() => history.push(APP_PATH.CREATE_ROLE_MAPPING)}
        >
          {createRoleMappingText}
        </EuiButton>
      )}
    />
  )

  render() {
    const { history } = this.props;
    const { isLoading, error, resources, isShowingTableSystemItems } = this.state;
    const getResourceEditUri = name => `${APP_PATH.CREATE_ROLE_MAPPING}?id=${name}&action=${ROLE_MAPPINGS_ACTIONS.UPDATE_ROLE_MAPPING}`;

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

    const missingRoleAlert = ({ _isCorrespondingRole, _id }) => (
      _isCorrespondingRole ? null : (
        <EuiCallOut
          size="s"
          iconType="alert"
          color="danger"
          title={noCorrespondingRoleText}
          data-test-subj={`sgTableCol-Name-${_id}-MissingRole`}
        />
      )
    );

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
        )
      },
      {
        field: 'users',
        name: usersText,
        footer: usersText,
        align: 'left',
        mobileOptions: {
          header: false
        },
        render: (items, { _id }) => (
          <TableItemsListCell name={`Users-${_id}`} items={items} />
        )
      },
      {
        field: 'backend_roles',
        name: rolesText,
        footer: rolesText,
        align: 'left',
        mobileOptions: {
          header: false
        },
        render: (items, { _id }) => (
          <TableItemsListCell name={`BackendRoles-${_id}`} items={items} />
        )
      },
      {
        field: 'hosts',
        name: hostsText,
        footer: hostsText,
        align: 'left',
        mobileOptions: {
          header: false
        },
        render: (items, { _id }) => (
          <TableItemsListCell name={`Hosts-${_id}`} items={items} />
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
        title={roleMappingsText}
        actions={[
          (<CancelButton onClick={() => history.push(APP_PATH.HOME)} />),
          (<CreateButton
            value={createRoleMappingText}
            onClick={() => history.push(APP_PATH.CREATE_ROLE_MAPPING)}
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

RoleMappings.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  rolesService: PropTypes.object.isRequired,
  roleMappingsService: PropTypes.object.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired
};

export default RoleMappings;
