import React, { Fragment, useContext } from 'react';
import { Context } from '../../../../../Context';
import { EuiCodeEditor, EuiLink } from '@elastic/eui';
import { FLYOUTS } from '../../../../../utils/constants';
import { stringifyPretty } from '../../../../../../utils/helpers';
import { actionBodyHelpLabel, mustacheLinkLabel, watchResultsLinkLabel } from '../../../../../utils/i18n/watch';

export default ({ watchResultData }) => {
  const {
    triggerFlyout
  } = useContext(Context);

  // This should not happen, but if we for some reason
  // get something different than an object
  if (typeof watchResultData !== 'object') {
    watchResultData = {};
  }

  const watchResultLink = (
    <EuiLink
      onClick={() => {
        triggerFlyout({
          type: FLYOUTS.CUSTOM,
          payload: {
            title: 'Properties available to the template',
            body: (<EuiCodeEditor
              mode="json"
              width="100%"
              value={stringifyPretty({ data: watchResultData })}
              readOnly
            />),
          }
        });
      }}
    >
      {watchResultsLinkLabel}
    </EuiLink>
  );

  const mustacheLink = (
    <EuiLink href="https://mustache.github.io/" target="_blank">
      {mustacheLinkLabel}
    </EuiLink>
  );

  return (
    <Fragment>
      {actionBodyHelpLabel(watchResultLink, mustacheLink)}
    </Fragment>
  );
};
