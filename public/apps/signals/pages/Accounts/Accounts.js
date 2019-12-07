import React, { Component } from 'react';
import { connect as connectRedux } from 'react-redux';
import PropTypes from 'prop-types';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiIcon
} from '@elastic/eui';
import {
  LEFT_ALIGNMENT,
} from '@elastic/eui/lib/services';
import { cloneDeep, get } from 'lodash';
import { AccountsService } from '../../services';
import { addSuccessToast, addErrorToast } from '../../redux/actions';
import {
  ContentPanel,
  TableDeleteAction,
  TableCloneAction,
  TableMultiDeleteButton,
  TableIdCell,
  TableTextCell,
  PopoverButton
} from '../../components';
import {
  deleteText,
  cloneText,
  saveText,
  typeText,
} from '../../utils/i18n/common';
import {
  accountsText
} from '../../utils/i18n/account';
import {
  TABLE_SORT_FIELD,
  TABLE_SORT_DIRECTION,
  ACCOUNT_TYPE
} from './utils/constants';
import { APP_PATH } from '../../utils/constants';

class Accounts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      isLoading: true,
      accounts: [],
      tableSelection: [],
      isAddAccountPopoverOpen: false
    };

    this.destService = new AccountsService(this.props.httpClient);
  }

  componentDidMount() {
    this.getAccounts();
  }

  putAccount = async ({ _id, ...account }) => {
    const { dispatch } = this.props;
    this.setState({ isLoading: true, error: null });
    try {
      await this.destService.put(account, _id, account.type);
      dispatch(addSuccessToast((<p>{saveText} {_id}</p>)));
      this.getAccounts();
    } catch (error) {
      console.error('Accounts -- putAccounts', error);
      dispatch(addErrorToast(error));
      this.setState({ error });
      console.debug('Accounts -- account', account);
    }
    this.setState({ isLoading: false });
  }

  getAccounts = async () => {
    const { dispatch } = this.props;
    this.setState({ isLoading: true, error: null });
    try {
      const { resp: accounts } = await this.destService.get();
      this.setState({ accounts });
    } catch (error) {
      console.error('Accounts -- getAccounts', error);
      dispatch(addErrorToast(error));
      this.setState({ error });
    }
    this.setState({ isLoading: false });
  }

  handleCloneAccount = async account => {
    const { dispatch } = this.props;
    this.setState({ isLoading: true, error: null });
    try {
      const { _id: id, ...rest } = account;
      await this.destService.put(cloneDeep({ ...rest }), `${id}_copy`, account.type);
      dispatch(addSuccessToast((<p>{cloneText} {id}</p>)));
      this.getAccounts();
    } catch (error) {
      console.error('Accounts -- cloneAccounts', error);
      dispatch(addErrorToast(error));
      this.setState({ error });
      console.debug('Destiantions -- account', account);
    }
    this.setState({ isLoading: false });
  }

  deleteAccounts = async (accounts = []) => {
    const { dispatch } = this.props;
    const promises = [];

    this.setState({ isLoading: true, error: null });
    accounts.forEach(({ _id: id, type }) => {
      const promise = this.destService.delete(id, type)
        .then(() => {
          dispatch(addSuccessToast((<p>{deleteText} {id}</p>)));
        })
        .catch(error => {
          console.error('Accounts -- deleteAccounts', error);
          dispatch(addErrorToast(error));
          this.setState({ error });
          console.debug('Accounts -- accountsIds', accounts.map(({ _id }) => _id));
        });
      promises.push(promise);
    });

    await Promise.all(promises);
    this.setState({ isLoading: false });
    this.getAccounts();
  }

  handleDeleteAccounts = (accounts = []) => {
    const { onTriggerConfirmDeletionModal } = this.props;
    onTriggerConfirmDeletionModal({
      body: accounts.map(({ _id }) => _id).join(', '),
      onConfirm: () => {
        this.deleteAccounts(accounts);
        onTriggerConfirmDeletionModal(null);
      },
      onCancel: () => {
        this.setState({ tableSelection: [] });
        onTriggerConfirmDeletionModal(null);
      }
    });
  }

  triggerAddAccountPopover = () => {
    this.setState(prevState => ({
      isAddAccountPopoverOpen: !prevState.isAddAccountPopoverOpen
    }));
  }

  addAccount = accountType => {
    this.triggerAddAccountPopover();
    this.props.history.push(`${APP_PATH.DEFINE_ACCOUNT}?accountType=${accountType}`);
  }

  renderToolsLeft = () => {
    const { tableSelection, isLoading } = this.state;
    if (tableSelection.length === 0) return null;

    const handleMultiDelete = () => {
      this.handleDeleteAccounts(tableSelection);
      // this.handleDeleteAccounts(tableSelection.map(({ _id, type }) => ({ id: _id, type })));
      this.setState({ tableSelection: [] });
    };

    return (
      <TableMultiDeleteButton
        onClick={handleMultiDelete}
        numOfSelections={tableSelection.length}
        isLoading={isLoading}
      />
    );
  }

  render() {
    const { history } = this.props;

    const {
      accounts,
      isLoading,
      error,
      isAddAccountPopoverOpen
    } = this.state;

    const actions = [
      {
        render: account => (
          <TableCloneAction
            name={account._id}
            onClick={() => this.handleCloneAccount(account)}
          />
        )
      },
      {
        render: account => (
          <TableDeleteAction
            name={account._id}
            onClick={() => this.handleDeleteAccounts([account])}
          />
        )
      }
    ];

    const columns = [
      {
        field: '_id',
        name: 'Id',
        footer: 'Id',
        alignment: LEFT_ALIGNMENT,
        truncateText: true,
        sortable: true,
        render: (id, { type }) => (
          <TableIdCell
            name={id}
            value={id}
            onClick={() => {
              history.push(`${APP_PATH.DEFINE_ACCOUNT}?id=${id}&accountType=${type}`);
            }}
          />
        )
      },
      {
        field: 'type',
        name: typeText,
        footer: typeText,
        render: (type, { _id }) => (
          <TableTextCell
            value={type}
            name={`Type-${_id}`}
          />
        )
      },
      {
        actions
      }
    ];

    const search = {
      toolsLeft: this.renderToolsLeft(),
      box: {
        incremental: true,
      }
    };

    const selection = {
      selectable: (doc) => doc._id,
      onSelectionChange: (tableSelection) => this.setState({ tableSelection })
    };

    const sorting = {
      sort: {
        field: TABLE_SORT_FIELD,
        direction: TABLE_SORT_DIRECTION
      }
    };

    const addAccountContextMenuPanels = [
      {
        id: 0,
        title: 'Accounts',
        items: [
          {
            name: 'Email',
            icon: (<EuiIcon type="email" size="m" />),
            onClick: () => this.addAccount(ACCOUNT_TYPE.EMAIL)
          },
          {
            name: 'Slack',
            icon: (<EuiIcon type="empty" size="m" />),
            onClick: () => this.addAccount(ACCOUNT_TYPE.SLACK)
          },
          {
            name: 'PagerDuty (coming soon)',
            icon: (<EuiIcon type="empty" size="m" />),
            onClick: () => null
          }
        ]
      }
    ];

    return (
      <ContentPanel
        title={accountsText}
        actions={[
          (
            <PopoverButton
              isPopoverOpen={isAddAccountPopoverOpen}
              contextMenuPanels={addAccountContextMenuPanels}
              onClick={this.triggerAddAccountPopover}
              name="AddAccount"
            />
          )
        ]}
      >
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiInMemoryTable
              error={get(error, 'message')}
              items={accounts}
              itemId="_id"
              columns={columns}
              search={search}
              selection={selection}
              sorting={sorting}
              loading={isLoading}
              isSelectable
              pagination
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </ContentPanel>
    );
  }
}

Accounts.propTypes = {
  httpClient: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  onTriggerConfirmDeletionModal: PropTypes.func.isRequired
};

export default connectRedux()(Accounts);
