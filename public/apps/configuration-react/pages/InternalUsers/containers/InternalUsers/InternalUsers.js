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
  EuiFlexGrid
} from '@elastic/eui';
import { get } from 'lodash';
import { ContentPanel } from '../../../../components';
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
  i18nCurrentUserText
} from '../../../../utils/i18n_nodes';
import { usersToTableUsers, tableUserToUser } from './utils';

const renderUserBackendRolesCell = roles => (
  <div>{roles.map((role, i) => <div key={i}>{role}</div>)}</div>
);

const renderUserNameCell = history => (name, user) => {
  const { username: currentUser } = JSON.parse(sessionStorage.getItem(SESSION_STORAGE.SG_USER));
  return(
    <div>
      <EuiFlexGroup>
        <EuiFlexItem>
          {user.readonly ? (
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
      {name === currentUser && (
        <EuiFlexGrid columns={2} gutterSize="s" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiIcon type="user"/>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size="s">{i18nCurrentUserText}</EuiText>
          </EuiFlexItem>
        </EuiFlexGrid>
      )}
      {user.readonly && (
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
// TODO: hook up a confirmation modal
class InternalUsers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      allUsers: [],
      error: null,
      isLoading: true,
      tableSelection: []
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const { internalUsersService } = this.props;
    try {
      this.setState({ isLoading: true });
      const { data: allUsers } = await internalUsersService.list();
      this.setState({ allUsers: usersToTableUsers(allUsers), error: null });
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

  deleteUsers = async userIds => {
    const { internalUsersService } = this.props;
    try {
      this.setState({ isLoading: true });
      for (let i = 0; i < userIds.length; i++) {
        await internalUsersService.delete(userIds[i]);
      }
    } catch(error) {
      this.handleTriggerCallout(error);
    }
    this.setState({ isLoading: false });
    this.fetchData();
  }

  cloneUser = async user => {
    const { internalUsersService } = this.props;
    let { id: username } = user;
    username += '_copy';
    try {
      this.setState({ isLoading: true });
      const doPreSaveUserAdaptation = false;
      await internalUsersService.save(username, tableUserToUser(user), doPreSaveUserAdaptation);
    } catch(error) {
      this.handleTriggerCallout(error);
    }
    this.setState({ isLoading: false });
    this.fetchData();
  }

  renderCreateUserButton = history => (
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

    const onClick = () => {
      this.deleteUsers([...tableSelection.map(item => item.id)]);
      this.setState({ tableSelection: [] });
    };

    return (
      <EuiButton
        color="danger"
        iconType="trash"
        onClick={onClick}
      >
        {i18nDeleteText} {tableSelection.length}
      </EuiButton>
    );
  }

  renderEmptyTableMessage = history => (
    <EuiEmptyPrompt
      title={<h3>No users</h3>}
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

  render() {
    const { isLoading, error, allUsers } = this.state;
    const { history } = this.props;

    const actions = [
      {
        name: 'Clone',
        description: 'Clone this user',
        icon: 'copy',
        type: 'icon',
        onClick: this.cloneUser
      }, {
        name: 'Delete',
        enabled: user => !user.readonly,
        description: 'Delete this user',
        icon: 'trash',
        type: 'icon',
        color: 'danger',
        onClick: user => this.deleteUsers([user.id])
      }
    ];

    // TODO: render 'current user' note in one of the columns
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
        render: renderUserNameCell(history)
      },
      {
        field: 'roles',
        name: i18nBackendRolesText,
        footer: i18nBackendRolesText,
        align: 'left',
        mobileOptions: {
          header: false
        },
        render: renderUserBackendRolesCell
      },
      {
        align: 'right',
        actions
      }
    ];

    const selection = {
      selectable: user => user.id,
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
          this.renderCreateUserButton(history)
        ]}
      >
        <EuiInMemoryTable
          items={allUsers}
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
