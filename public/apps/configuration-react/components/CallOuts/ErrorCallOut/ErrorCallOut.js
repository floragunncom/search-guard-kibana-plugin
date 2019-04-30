import React from 'react';
import PropTypes from 'prop-types';
import { EuiFlexGroup, EuiFlexItem, EuiCallOut } from '@elastic/eui';
import { i18nErrorText } from '../../../utils/i18n_nodes';

const ErrorCallOut = ({ text }) => (
  <EuiFlexGroup>
    <EuiFlexItem>
      <EuiCallOut
        title={i18nErrorText}
        color="danger"
        iconType="cross"
      >
        {text}
      </EuiCallOut>
    </EuiFlexItem>
  </EuiFlexGroup>
);

ErrorCallOut.propTypes = {
  text: PropTypes.node.isRequired
};

export default ErrorCallOut;
