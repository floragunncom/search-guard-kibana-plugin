/* eslint-disable @kbn/eslint/require-license-header */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiIcon,
  EuiSearchBar,
  EuiSpacer,
} from '@elastic/eui';
import { LEFT_ALIGNMENT } from '@elastic/eui/lib/services';
import { cloneDeep, get } from 'lodash';
import { AccountsService } from '../../services';
import {
  ContentPanel,
  TableDeleteAction,
  TableCloneAction,
  TableMultiDeleteButton,
  TableIdCell,
  TableTextCell,
  PopoverButton,
} from '../../components';
import { buildESQuery, getResourceEditUri } from './utils/helpers';
import { deleteText, cloneText, saveText, typeText } from '../../utils/i18n/common';
import { accountsText } from '../../utils/i18n/account';
import { TABLE_SORT_FIELD, TABLE_SORT_DIRECTION, ACCOUNT_TYPE } from './utils/constants';
import { APP_PATH } from '../../utils/constants';

import { Context } from '../../Context';

const initialQuery = EuiSearchBar.Query.MATCH_ALL;
class Accounts extends Component {
  static contextType = Context;

  constructor(props, context) {
    super(props, context);

    this.state = {
      error: null,
      isLoading: true,
      accounts: [],
      tableSelection: [],
      isAddAccountPopoverOpen: false,
      query: initialQuery,
    };

    this.destService = new AccountsService(context.httpClient);
  }

  componentDidMount() {
    this.getAccounts();
  }

  componentDidUpdate(prevProps, prevState) {
    const { query: prevQuery } = prevState;
    const { query } = this.state;
    if (JSON.stringify(prevQuery) !== JSON.stringify(query)) {
      this.getAccounts();
    }
  }

  putAccount = async ({ _id, ...account }) => {
    this.setState({ isLoading: true, error: null });
    try {
      await this.destService.put(account, _id, account.type);
      this.context.addSuccessToast(
        <p>
          {saveText} {_id}
        </p>
      );
      this.getAccounts();
    } catch (error) {
      console.error('Accounts -- putAccounts', error);
      this.context.addErrorToast(error);
      this.setState({ error });
      console.debug('Accounts -- account', account);
    }
    this.setState({ isLoading: false });
  };

  getAccounts = async () => {
    const { query } = this.state;
    this.setState({ isLoading: true });

    try {
      const esQuery = buildESQuery(EuiSearchBar.Query.toESQuery(query));
      console.debug('Accounts -- getAccounts -- esQuery', esQuery);

      const { resp: accounts } = await this.destService.search(esQuery);
      this.setState({ accounts, error: null });
    } catch (error) {
      console.error('Accounts -- getAccounts', error);
      this.context.addErrorToast(error);
      this.setState({ error });
    }

    this.setState({ isLoading: false });
  };

  handleCloneAccount = async account => {
    this.setState({ isLoading: true, error: null });
    try {
      const { _id: id, ...rest } = account;
      await this.destService.put(cloneDeep({ ...rest }), `${id}_copy`, account.type);
      this.context.addSuccessToast(
        <p>
          {cloneText} {id}
        </p>
      );
      this.getAccounts();
    } catch (error) {
      console.error('Accounts -- cloneAccounts', error);
      this.context.addErrorToast(error);
      this.setState({ error });
      console.debug('Destiantions -- account', account);
    }
    this.setState({ isLoading: false });
  };

  deleteAccounts = async (accounts = []) => {
    const promises = [];

    this.setState({ isLoading: true, error: null });
    accounts.forEach(({ _id: id, type }) => {
      const promise = this.destService
        .delete(id, type)
        .then(() => {
          this.context.addSuccessToast(
            <p>
              {deleteText} {id}
            </p>
          );
        })
        .catch(error => {
          console.error('Accounts -- deleteAccounts', error);
          this.context.addErrorToast(error);
          this.setState({ error });
          console.debug(
            'Accounts -- accountsIds',
            accounts.map(({ _id }) => _id)
          );
        });
      promises.push(promise);
    });

    await Promise.all(promises);
    this.setState({ isLoading: false });
    this.getAccounts();
  };

  handleDeleteAccounts = (accounts = []) => {
    const { triggerConfirmDeletionModal } = this.context;
    triggerConfirmDeletionModal({
      body: accounts.map(({ _id }) => _id).join(', '),
      onConfirm: () => {
        this.deleteAccounts(accounts);
        triggerConfirmDeletionModal(null);
      },
      onCancel: () => {
        this.setState({ tableSelection: [] });
        triggerConfirmDeletionModal(null);
      },
    });
  };

  triggerAddAccountPopover = () => {
    this.setState(prevState => ({
      isAddAccountPopoverOpen: !prevState.isAddAccountPopoverOpen,
    }));
  };

  addAccount = accountType => {
    this.triggerAddAccountPopover();
    this.props.history.push(`${APP_PATH.DEFINE_ACCOUNT}?accountType=${accountType}`);
  };

  renderToolsLeft = () => {
    const { tableSelection, isLoading } = this.state;
    if (tableSelection.length === 0) return null;

    const handleMultiDelete = () => {
      this.handleDeleteAccounts(tableSelection);
      this.setState({ tableSelection: [] });
    };

    return (
      <TableMultiDeleteButton
        onClick={handleMultiDelete}
        numOfSelections={tableSelection.length}
        isLoading={isLoading}
      />
    );
  };

  handleSearchChange = ({ query, error }) => {
    if (error) {
      this.setState({ error });
    } else {
      this.setState({
        error: null,
        query: query.text ? query : initialQuery,
      });
    }
  };

  // TODO: have search in URL params too
  renderSearchBar = () => {
    const areRowsSelected = !!this.state.tableSelection.length;

    return (
      <EuiFlexGroup>
        {areRowsSelected && <EuiFlexItem grow={false}>{this.renderToolsLeft()}</EuiFlexItem>}
        <EuiFlexItem>
          <EuiSearchBar onChange={this.handleSearchChange} />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  render() {
    const { history } = this.props;
    const { accounts, isLoading, error, isAddAccountPopoverOpen } = this.state;

    const actions = [
      {
        render: account => (
          <TableCloneAction name={account._id} onClick={() => this.handleCloneAccount(account)} />
        ),
      },
      {
        render: account => (
          <TableDeleteAction
            name={account._id}
            onClick={() => this.handleDeleteAccounts([account])}
          />
        ),
      },
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
              history.push(getResourceEditUri(id, type));
            }}
          />
        ),
      },
      {
        field: 'type',
        name: typeText,
        footer: typeText,
        render: (type, { _id }) => <TableTextCell value={type} name={`Type-${_id}`} />,
      },
      {
        actions,
      },
    ];

    const selection = {
      selectable: doc => doc._id,
      onSelectionChange: tableSelection => this.setState({ tableSelection }),
    };

    const sorting = {
      sort: {
        field: TABLE_SORT_FIELD,
        direction: TABLE_SORT_DIRECTION,
      },
    };

    const addAccountContextMenuPanels = [
      {
        id: 0,
        title: 'Accounts',
        items: [
          {
            name: 'Email',
            icon: <EuiIcon type="email" size="m" />,
            onClick: () => this.addAccount(ACCOUNT_TYPE.EMAIL),
          },
          {
            name: 'Slack',
            icon: <EuiIcon type="empty" size="m" />,
            onClick: () => this.addAccount(ACCOUNT_TYPE.SLACK),
          },
          {
            name: 'Jira',
            icon: <EuiIcon type="empty" size="m" />,
            onClick: () => this.addAccount(ACCOUNT_TYPE.JIRA),
          },
          {
            name: 'PagerDuty',
            icon: <EuiIcon type="empty" size="m" />,
            onClick: () => this.addAccount(ACCOUNT_TYPE.PAGERDUTY),
          },
        ],
      },
    ];

    return (
      <ContentPanel
        title={accountsText}
        actions={[
          <PopoverButton
            isPopoverOpen={isAddAccountPopoverOpen}
            contextMenuPanels={addAccountContextMenuPanels}
            onClick={this.triggerAddAccountPopover}
            name="AddAccount"
          />,
        ]}
      >
        {this.renderSearchBar()}
        <EuiSpacer />
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiInMemoryTable
              error={get(error, 'message')}
              items={accounts}
              itemId="_id"
              columns={columns}
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
  history: PropTypes.object.isRequired,
};

export default Accounts;
