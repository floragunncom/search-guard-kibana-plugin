/*
 *    Copyright 2021 floragunn GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiBadge,
  EuiIcon,
  EuiSearchBar,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { LEFT_ALIGNMENT } from '@elastic/eui/lib/services';
import { cloneDeep, get } from 'lodash';
import { AccountsService } from '../../services';
import {
  ContentPanel,
  TableMultiDeleteButton,
  TableIdCell,
  TableTextCell,
  PopoverButton,
} from '../../components';
import {
  buildESQuery,
  buildTenantAccounts,
  getResourceEditUri,
  getResourceReadUri,
} from './utils/helpers';
import { deleteText, cloneText, saveText, typeText, jsonText } from '../../utils/i18n/common';
import {
  accountBehaviorText,
  accountsText,
  cloneTenantAccountTitleText,
  globalAccountsDescriptionText,
  shadowsGlobalAccountText,
  tenantAccountShadowWarningText,
  tenantAccountsDescriptionText,
  tenantAccountsText,
} from '../../utils/i18n/account';
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
    this.tenantDestService = new AccountsService(context.httpClient, undefined, true);
    this.canManageTenantAccounts =
      context.isMultitenancyEnabled && context.tenantAccountPermissions.manage;
  }

  componentDidMount() {
    this.getAccounts();
  }

  componentDidUpdate(prevProps, prevState) {
    const { query: prevQuery } = prevState;
    const { query } = this.state;
    if (
      JSON.stringify(prevQuery) !== JSON.stringify(query) ||
      prevProps.scope !== this.props.scope
    ) {
      this.getAccounts();
    }
  }

  putAccount = async ({ _id, ...account }) => {
    this.setState({ isLoading: true, error: null });
    try {
      const service = account._tenant ? this.tenantDestService : this.destService;
      await service.put(account, _id, account.type);
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

      const tenantScoped = this.props.scope === 'tenant';
      const service = tenantScoped ? this.tenantDestService : this.destService;
      const { resp } = await service.search(esQuery);
      const accounts = tenantScoped ? buildTenantAccounts(resp) : resp;
      this.setState({ accounts, error: null });
    } catch (error) {
      console.error('Accounts -- getAccounts', error);
      this.context.addErrorToast(error);
      this.setState({ error });
    }

    this.setState({ isLoading: false });
  };

  cloneAccount = async (account, id) => {
    try {
      const { _id, ...rest } = account;
      const service = account._tenant ? this.tenantDestService : this.destService;
      await service.put(cloneDeep({ ...rest }), id, account.type);
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

  handleCloneAccount = async (account) => {
    this.setState({ isLoading: true, error: null });
    const id = `${account._id}_copy`;

    if (account._tenant) {
      try {
        await this.destService.get(id, account.type);
        this.context.triggerConfirmModal({
          title: cloneTenantAccountTitleText,
          body: <p>{tenantAccountShadowWarningText(id)}</p>,
          onConfirm: () => {
            this.context.triggerConfirmModal(null);
            this.cloneAccount(account, id);
          },
          onCancel: () => {
            this.setState({ isLoading: false });
            this.context.triggerConfirmModal(null);
          },
        });
        return;
      } catch (error) {
        if (!error.body || error.body.statusCode !== 404) {
          this.context.addErrorToast(error);
          this.setState({ isLoading: false, error });
          return;
        }
      }
    }

    await this.cloneAccount(account, id);
  };

  deleteAccounts = async (accounts = []) => {
    const promises = [];

    this.setState({ isLoading: true, error: null });
    accounts.forEach(({ _id: id, type, _tenant: tenant }) => {
      const service = tenant ? this.tenantDestService : this.destService;
      const promise = service
        .delete(id, type)
        .then(() => {
          this.context.addSuccessToast(
            <p>
              {deleteText} {id}
            </p>
          );
        })
        .catch((error) => {
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
    this.setState((prevState) => ({
      isAddAccountPopoverOpen: !prevState.isAddAccountPopoverOpen,
    }));
  };

  addAccount = (accountType) => {
    this.triggerAddAccountPopover();
    const scope = this.props.scope === 'tenant' ? '&scope=tenant' : '';
    this.props.history.push(`${APP_PATH.DEFINE_ACCOUNT}?accountType=${accountType}${scope}`);
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
    const tenantScoped = this.props.scope === 'tenant';
    const { accounts, isLoading, error, isAddAccountPopoverOpen } = this.state;

    const actions = [
      {
        'data-test-subj': 'sgTableCol-jsonAccount',
        name: jsonText,
        description: 'Account JSON',
        icon: 'document',
        type: 'icon',
        onClick: ({ _id, type, _tenant: tenant }) =>
          history.push(getResourceReadUri(_id, type, !!tenant)),
      },
      ...(!tenantScoped || this.canManageTenantAccounts
        ? [
            {
              'data-test-subj': 'sgTableCol-ActionClone',
              name: cloneText,
              description: 'Clone the watch',
              icon: 'copy',
              type: 'icon',
              onClick: this.handleCloneAccount,
            },
            {
              'data-test-subj': 'sgTableCol-ActionDelete',
              name: deleteText,
              description: 'Delete the watch',
              icon: 'trash',
              type: 'icon',
              color: 'danger',
              onClick: (account) => this.handleDeleteAccounts([account]),
            },
          ]
        : []),
    ];

    const columns = [
      {
        field: '_id',
        name: 'Id',
        footer: 'Id',
        alignment: LEFT_ALIGNMENT,
        truncateText: true,
        sortable: true,
        render: (id, { type, _tenant: tenant }) =>
          tenantScoped && !this.canManageTenantAccounts ? (
            <TableTextCell value={id} name={id} />
          ) : (
            <TableIdCell
              name={id}
              value={id}
              onClick={() => {
                history.push(getResourceEditUri(id, type, !!tenant));
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
      ...(tenantScoped
        ? [
            {
              field: '_shadowsGlobal',
              name: accountBehaviorText,
              render: (shadowsGlobal) =>
                shadowsGlobal ? (
                  <EuiBadge color="warning">{shadowsGlobalAccountText}</EuiBadge>
                ) : null,
            },
          ]
        : []),
      {
        actions,
      },
    ];

    const selection =
      tenantScoped && !this.canManageTenantAccounts
        ? undefined
        : {
            onSelectionChange: (tableSelection) => this.setState({ tableSelection }),
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
        title: tenantScoped ? tenantAccountsText : accountsText,
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
        title={tenantScoped ? tenantAccountsText : accountsText}
        actions={
          tenantScoped && !this.canManageTenantAccounts
            ? []
            : [
                <PopoverButton
                  isPopoverOpen={isAddAccountPopoverOpen}
                  contextMenuPanels={addAccountContextMenuPanels}
                  onClick={this.triggerAddAccountPopover}
                  name="AddAccount"
                />,
              ]
        }
      >
        <EuiText size="s">
          <p>{tenantScoped ? tenantAccountsDescriptionText : globalAccountsDescriptionText}</p>
        </EuiText>
        <EuiSpacer />
        {this.renderSearchBar()}
        <EuiSpacer />
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiInMemoryTable
              error={get(error, 'message')}
              items={accounts}
              itemId={(account) =>
                `${account._tenant ? 'tenant' : 'global'}/${account.type}/${account._id}`
              }
              columns={columns}
              selection={selection}
              sorting={sorting}
              loading={isLoading}
              isSelectable={!!selection}
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
  scope: PropTypes.oneOf(['global', 'tenant']),
};

Accounts.defaultProps = {
  scope: 'global',
};

export default Accounts;
