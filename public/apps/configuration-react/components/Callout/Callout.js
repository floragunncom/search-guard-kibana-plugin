import React from 'react';
import PropTypes from 'prop-types';
import { EuiCallOut, EuiFlexGroup, EuiFlexItem, EuiButton } from '@elastic/eui';
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
    title,
    text
  } = calloutData;

  return (
    <EuiFlexGroup>
      <EuiFlexItem>
        <EuiCallOut title={title} iconType={iconType} color={color} {...calloutProps}>
          <p>{text}</p>
          <EuiButton size="s" onClick={onClose} color={color}>{i18nCloseText}</EuiButton>
        </EuiCallOut>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

Callout.propTypes = {
  callout: PropTypes.shape({
    type: PropTypes.string.isRequired,
    payload: PropTypes.node.isRequired
  }),
  onClose: PropTypes.func.isRequired
};

export default Callout;

/*
const getFlyoutProps = ({ type, payload }) => {
  const flyout = Flyouts[type];
  if (!flyout || !(flyout instanceof Function)) return null;
  return flyout(payload);
};

const Flyout = ({ flyout, onClose }) => {
  if (!flyout) return null;
  const flyoutData = getFlyoutProps(flyout);
  if (!flyoutData) return null;
  const {
    header = null,
    body = null,
    footer = null,
    flyoutProps = {},
    headerProps = {},
    bodyProps = {},
    footerProps = {}
  } = flyoutData;

  return (
    <EuiFlyout onClose={onClose} {...flyoutProps}>
      {header && <EuiFlyoutHeader {...headerProps}>{header}</EuiFlyoutHeader>}
      {body && <EuiFlyoutBody {...bodyProps}>{body}</EuiFlyoutBody>}
      {footer && <EuiFlyoutFooter {...footerProps}>{footer}</EuiFlyoutFooter>}
    </EuiFlyout>
  );
};

Flyout.propTypes = {
  flyout: PropTypes.shape({
    type: PropTypes.string.isRequired,
    payload: PropTypes.any
  }),
  onClose: PropTypes.func.isRequired,
};

export default Flyout;
*/
