import React from 'react';
import PropTypes from 'prop-types';
import { EuiButton } from '@elastic/eui';
import { ContentPanel } from '../../../../components';
import { APP_PATH } from '../../../../utils/constants';
import {
  i18nCreateInternalUserText,
  i18nCancelText,
  i18nInternalUsersText
} from '../../../../utils/i18n_nodes';

const renderCreateUserButton = history => (
  <EuiButton
    onClick={() =>
      history.push(APP_PATH.CREATE_INTERNAL_USER)
    }
  >
    {i18nCreateInternalUserText}
  </EuiButton>
);

const renderCancelButton = history => (
  <EuiButton
    onClick={() => history.push(APP_PATH.HOME)}
  >
    {i18nCancelText}
  </EuiButton>
);

const InternalUsers = ({ history }) => (
  <ContentPanel
    title={i18nInternalUsersText}
    actions={[
      renderCancelButton(history),
      renderCreateUserButton(history)
    ]}
  >
    <p>TODO: add table of users here ... </p>
  </ContentPanel>
);

InternalUsers.propTypes = {
  history: PropTypes.object.isRequired
};

export default InternalUsers;
