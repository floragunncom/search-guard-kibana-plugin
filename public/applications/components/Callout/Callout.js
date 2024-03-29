import React from 'react';
import PropTypes from 'prop-types';
import {
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiSpacer,
  EuiText,
  EuiErrorBoundary,
} from '@elastic/eui';
import Callouts from './callouts';
import { closeText } from '../../utils/i18n/common';

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
    <EuiErrorBoundary>
      <EuiFlexGroup className="sgCallout">
        <EuiFlexItem>
          <EuiCallOut
            title={title}
            iconType={iconType}
            color={color}
            {...calloutProps}
          >
            <EuiText className="sgCalloutBody">{text}</EuiText>
            <EuiSpacer />
            <EuiButton
              data-test-subj="sgCalloutCloseButton"
              size="s"
              onClick={onClose}
              {...closeButtonProps}
            >
              {closeText}
            </EuiButton>
          </EuiCallOut>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiErrorBoundary>
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
