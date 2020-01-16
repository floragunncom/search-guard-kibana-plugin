import React, { Fragment, useContext } from 'react';
import { Context } from '../../../../../Context';
import { EuiCodeEditor, EuiLink } from '@elastic/eui';
import { FLYOUTS } from '../../../../../utils/constants';
import { stringifyPretty } from '../../../../../../utils/helpers';
import {
  watchResultsFlyoutTitle,
  actionBodyHelpLabelWithResults,
  actionBodyHelpLabelWithoutResults,
  mustacheLinkLabel,
  watchResultsLinkLabel
} from '../../../../../utils/i18n/watch';

export default ({ watchResultData }) => {
  const {
    triggerFlyout
  } = useContext(Context);

  const hasWatchResultData = (watchResultData !== null && typeof watchResultData === 'object');
  let label = '';

  const mustacheLink = (
    <EuiLink href="https://mustache.github.io/" target="_blank">
      {mustacheLinkLabel}
    </EuiLink>
  );

  if (hasWatchResultData) {
    const watchResultLink = (
      <EuiLink
        onClick={() => {
          triggerFlyout({
            type: FLYOUTS.CUSTOM,
            payload: {
              title: watchResultsFlyoutTitle,
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

    label = actionBodyHelpLabelWithResults(watchResultLink, mustacheLink);
  } else {
    label = actionBodyHelpLabelWithoutResults(mustacheLink)
  }

  return (
    <Fragment>
      {label}
    </Fragment>
  );
};
