import React from 'react';
import PropTypes from 'prop-types';
import { EuiCallOut, EuiFlexGroup, EuiFlexItem, EuiButton, EuiSpacer } from '@elastic/eui';
import Callouts from './callouts';
import { i18nCloseText } from '../../utils/i18n_nodes';

const getCalloutProps = ({ type, payload }) => {
  const callout = Callouts[type];
  if (!callout || !(callout instanceof Function)) return null;
  return callout(payload);
};

const Callout = ({ callout, onClose }) => {
  if (!callout) return null;
  const calloutData = getCalloutProps(callout);
  if (!calloutData) return null;
  const {
    calloutProps,
    iconType,
    color,
    closeButtonProps,
    title,
    text
  } = calloutData;

  return (
    <EuiFlexGroup>
      <EuiFlexItem>
        <EuiCallOut title={title} iconType={iconType} color={color} {...calloutProps}>
          {text}
          <EuiSpacer />
          <EuiButton size="s" onClick={onClose} {...closeButtonProps}>{i18nCloseText}</EuiButton>
        </EuiCallOut>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

Callout.propTypes = {
  callout: PropTypes.shape({
    type: PropTypes.string.isRequired,
    payload: PropTypes.any.isRequired
  }),
  onClose: PropTypes.func.isRequired
};

export default Callout;
