import React from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFlyoutFooter
} from '@elastic/eui';
import Flyouts from './flyouts';

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
    payload: PropTypes.any.isRequired
  }),
  onClose: PropTypes.func.isRequired,
};

export default Flyout;
