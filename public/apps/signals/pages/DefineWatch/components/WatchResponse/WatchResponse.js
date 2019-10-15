import React from 'react';
import PropTypes from 'prop-types';
import {
  EuiLink,
  EuiText,
  EuiFormRow,
  EuiCodeEditor,
} from '@elastic/eui';
import {
  closeText,
  responseText,
} from '../../../../utils/i18n/common';

const WatchResponse = ({ onClose, response }) => {
  const renderCloseLink = () => (
    <EuiText
      size="xs"
      onClick={onClose}
    >
      <EuiLink
        id="close-response"
        data-test-subj="sgWatch-CloseResponse"
      >
        {closeText} X
      </EuiLink>
    </EuiText>
  );

  return (
    <EuiFormRow
      fullWidth
      label={responseText}
      labelAppend={renderCloseLink()}
    >
      <EuiCodeEditor
        mode="json"
        width="100%"
        height="500px"
        value={response}
        readOnly
      />
    </EuiFormRow>
  );
};

WatchResponse.propTypes = {
  onClose: PropTypes.func.isRequired,  
  response: PropTypes.string,
};

export default WatchResponse;
