import React from 'react';
import PropTypes from 'prop-types';
import { ContentPanel } from '../../../../components';
import { EuiButton } from '@elastic/eui';
import { APP_PATH } from '../../../../utils/constants';
import {
  i18nSaveText,
  i18nCancelText,
  i18nCreateInternalUserText
} from '../../../../utils/i18n_nodes';

const renderSaveButton = history => (
  <EuiButton
    onClick={() => history.push(APP_PATH.INTERNAL_USERS)}
  >
    {i18nSaveText}
  </EuiButton>
);

const renderCancelButton = history => (
  <EuiButton
    onClick={() => history.push(APP_PATH.INTERNAL_USERS)}
  >
    {i18nCancelText}
  </EuiButton>
);

const CreateInternalUser = ({ history }) => (
  <ContentPanel
    title={i18nCreateInternalUserText}
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
