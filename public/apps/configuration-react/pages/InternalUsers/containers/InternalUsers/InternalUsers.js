import React from 'react';
import PropTypes from 'prop-types';
import { EuiI18n, EuiButton } from '@elastic/eui';
import { ContentPanel } from '../../../../components';
import { APP_PATH } from '../../../../utils/constants';

const renderCreateUserButton = history => (
  <EuiButton
    onClick={() =>
      history.push(APP_PATH.CREATE_INTERNAL_USER)
    }
  >
    <EuiI18n
      token="sgCreateInternalUser.text"
      default="Create User"
    />
  </EuiButton>
);

const renderCancelButton = history => (
  <EuiButton
    onClick={() => history.push(APP_PATH.HOME)}
  >
    <EuiI18n
      token="sgCancel.text"
      default="Cancel"
    />
  </EuiButton>
);

const InternalUsers = ({ history }) => (
  <ContentPanel
    title={(
      <EuiI18n
        token="sgInternalUsers.text"
        default="Internal Users"
      />
    )}
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
