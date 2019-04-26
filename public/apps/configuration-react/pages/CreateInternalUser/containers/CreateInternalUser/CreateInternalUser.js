import React from 'react';
import PropTypes from 'prop-types';
import { ContentPanel } from '../../../../components';
import { EuiI18n, EuiButton } from '@elastic/eui';
import { APP_PATH } from '../../../../utils/constants';

const renderSaveButton = history => (
  <EuiButton
    onClick={() => history.push(APP_PATH.INTERNAL_USERS)}
  >
    <EuiI18n
      token="sgSave.text"
      default="Save"
    />
  </EuiButton>
);

const renderCancelButton = history => (
  <EuiButton
    onClick={() => history.push(APP_PATH.INTERNAL_USERS)}
  >
    <EuiI18n
      token="sgCancel.text"
      default="Cancel"
    />
  </EuiButton>
);

const CreateInternalUser = ({ history }) => (
  <ContentPanel
    title={(
      <EuiI18n
        token="sgCreateInternalUser.text"
        default="Create User"
      />
    )}
    actions={[
      renderCancelButton(history),
      renderSaveButton(history)
    ]}
  >
    <p>TODO: add a form to create user ... </p>
  </ContentPanel>
);

CreateInternalUser.propTypes = {
  history: PropTypes.object.isRequired
};

export default CreateInternalUser;
