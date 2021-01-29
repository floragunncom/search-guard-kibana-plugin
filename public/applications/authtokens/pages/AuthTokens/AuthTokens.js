/*
 *    Copyright 2020 floragunn GmbH
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

import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { EuiInMemoryTable, EuiEmptyPrompt, EuiLink, EuiText, EuiSwitch } from '@elastic/eui';
import {
  ContentPanel,
  CancelButton,
  TableDeleteAction,
  CreateButton,
  TableMultiDeleteButton,
} from '../../../components';
import { AuthTokensService } from '../../services';
import {
  authTokensText,
  authTokensDescriptionText,
  noAuthTokensText,
  createdAtText,
  expiresAtText,
  userNameText,
  revokedAtText,
  revokedTokensText,
  createAuthTokenText,
  theFeatureIsDisabledText,
} from '../../utils/i18n/auth_tokens';
import { nameText } from '../../utils/i18n/common';
import { APP_PATH } from '../../utils/constants';
import { useResourcesTable } from '../../hooks';
import { toHumanDate, getResourceEditUri, tokensToUiTokens } from './utils';
import { Context } from '../../Context';

export function TableColumnText({ value, revokedAt, dataTestSubj }) {
  if (!value) return null;
  return (
    <EuiText
      size="s"
      data-test-subj={dataTestSubj}
      color={Number.isFinite(revokedAt) ? 'subdued' : 'default'}
    >
      {value}
    </EuiText>
  );
}

export function TableColumnDate({ value, revokedAt, dataTestSubj }) {
  if (!value) return null;
  return (
    <EuiText
      size="s"
      data-test-subj={dataTestSubj}
      color={Number.isFinite(revokedAt) ? 'subdued' : 'default'}
    >
      {toHumanDate(value)}
    </EuiText>
  );
}

export function TableColumnTokenName({ value, revokedAt, dataTestSubj, onClick }) {
  return (
    <EuiLink
      onClick={onClick}
      data-test-subj={dataTestSubj}
      color={Number.isFinite(revokedAt) ? 'subdued' : 'primary'}
    >
      {value}
    </EuiLink>
  );
}

export function AuthTokens({ history }) {
  const { triggerWarningCallout } = useContext(Context);
  const {
    service,
    isLoading,
    tableError,
    tableResources,
    deleteTableResources,
    tableResourcesSelection,
    setTableResourcesSelection,
  } = useResourcesTable({
    Service: AuthTokensService,
  });

  const [showRevokedTokens, setShowRevokedTokens] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [revokedTokens, setRevokedTokens] = useState([]);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableResources]);

  async function init() {
    const uiTokens = tokensToUiTokens(tableResources);
    setTokens(uiTokens.tokens);
    setRevokedTokens(uiTokens.revokedTokens);
    console.debug('AuthTokens, init, uiTokens', uiTokens);

    try {
      const isEnabled = await service.isServiceEnabled();
      if (!isEnabled) triggerWarningCallout(theFeatureIsDisabledText);
    } catch (error) {
      console.error('AuthTokens, init, isServiceEnabled', error);
    }
  }

  function renderTableToolsRight() {
    return (
      <EuiSwitch
        data-test-subj="sgTableSwitch-RevokedTokens"
        label={revokedTokensText}
        checked={showRevokedTokens}
        onChange={() => {
          setShowRevokedTokens(!showRevokedTokens);
        }}
      />
    );
  }

  function renderTableToolsLeft() {
    if (tableResourcesSelection.length === 0) return null;
    return (
      <TableMultiDeleteButton
        onClick={() => deleteTableResources(tableResourcesSelection.map(({ _id }) => _id))}
        numOfSelections={tableResourcesSelection.length}
      />
    );
  }

  const tableSelection = {
    onSelectionChange: setTableResourcesSelection,
  };

  const tableActions = [
    {
      render: ({ _id }) => {
        return <TableDeleteAction name={_id} onClick={() => deleteTableResources([_id])} />;
      },
    },
  ];

  const tableColumns = [
    {
      field: '_id',
      name: 'Id',
      footer: 'Id',
      align: 'left',
      sortable: false,
      render: (value, { _id, token_name: name, revoked_at: revokedAt }) => (
        <TableColumnText
          value={value}
          revokedAt={revokedAt}
          dataTestSubj={`sgTableCol-Id-${name}-${_id}`}
        />
      ),
    },
    {
      field: 'token_name',
      name: nameText,
      footer: nameText,
      align: 'left',
      sortable: true,
      render: (value, { _id, revoked_at: revokedAt }) => (
        <TableColumnTokenName
          value={value}
          revokedAt={revokedAt}
          dataTestSubj={`sgTableCol-TokenName-${_id}`}
          onClick={() => {
            history.push(getResourceEditUri(_id));
          }}
        />
      ),
    },
    {
      field: 'user_name',
      name: userNameText,
      footer: userNameText,
      align: 'left',
      sortable: true,
      render: (value, { _id, revoked_at: revokedAt }) => (
        <TableColumnText
          value={value}
          revokedAt={revokedAt}
          dataTestSubj={`sgTableCol-UserName-${_id}`}
        />
      ),
    },
    {
      field: 'expires_at',
      name: expiresAtText,
      footer: expiresAtText,
      align: 'left',
      sortable: true,
      render: (value, { _id, revoked_at: revokedAt }) => (
        <TableColumnDate
          value={value}
          revokedAt={revokedAt}
          dataTestSubj={`sgTableCol-ExpiresAt-${_id}`}
        />
      ),
    },
    {
      field: 'created_at',
      name: createdAtText,
      footer: createdAtText,
      align: 'left',
      sortable: true,
      render: (value, { _id, revoked_at: revokedAt }) => (
        <TableColumnDate
          value={value}
          revokedAt={revokedAt}
          dataTestSubj={`sgTableCol-CreatedAt-${_id}`}
        />
      ),
    },
  ];

  if (showRevokedTokens) {
    tableColumns.push({
      field: 'revoked_at',
      name: revokedAtText,
      footer: revokedAtText,
      align: 'left',
      sortable: true,
      render: (value, { _id, revoked_at: revokedAt }) => (
        <TableColumnDate
          value={value}
          revokedAt={revokedAt}
          dataTestSubj={`sgTableCol-RevokedAt-${_id}`}
        />
      ),
    });
  } else {
    tableColumns.push({
      width: '5%',
      align: 'right',
      actions: tableActions,
    });
  }

  const tableSearch = {
    box: {
      incremental: true,
    },
    toolsLeft: renderTableToolsLeft(),
    toolsRight: renderTableToolsRight(),
  };

  const tableProps = {
    itemId: '_id',
    items: showRevokedTokens ? revokedTokens : tokens,
    error: tableError,
    loading: isLoading,
    columns: tableColumns,
    search: tableSearch,
    sorting: true,
    pagination: {
      pageIndex: 0,
      totalItemCount: 10,
      pageSize: 50,
    },
    message: <EuiEmptyPrompt title={<h3>{noAuthTokensText}</h3>} titleSize="xs" />,
  };

  if (!showRevokedTokens) {
    tableProps.selection = tableSelection;
    tableProps.isSelectable = true;
  }

  return (
    <ContentPanel
      title={authTokensText}
      description={authTokensDescriptionText}
      actions={[
        <CancelButton onClick={() => history.push(APP_PATH.HOME)} />,
        <CreateButton
          value={createAuthTokenText}
          onClick={() => history.push(APP_PATH.CREATE_AUTH_TOKEN)}
        />,
      ]}
    >
      <EuiInMemoryTable {...tableProps} />
    </ContentPanel>
  );
}

AuthTokens.propTypes = {
  history: PropTypes.object.isRequired,
};
