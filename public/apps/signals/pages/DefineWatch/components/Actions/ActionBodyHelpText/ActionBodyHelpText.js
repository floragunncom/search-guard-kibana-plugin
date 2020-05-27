/* eslint-disable @kbn/eslint/require-license-header */
import React, { Fragment, useContext } from 'react';
import { Context } from '../../../../../Context';
import { EuiCodeEditor, EuiFormRow, EuiLink } from '@elastic/eui';
import { FLYOUTS } from '../../../../../utils/constants';
import { stringifyPretty } from '../../../../../../utils/helpers';
import {
  responseText,
  watchResultsFlyoutTitle,
  actionBodyHelpLabelWithResults,
  actionBodyHelpLabelWithoutResults,
  mustacheLinkLabel,
  watchResultsLinkLabel,
} from '../../../../../utils/i18n/watch';

export default ({ watchResultData, isHTML = false }) => {
  const { editorTheme, triggerFlyout } = useContext(Context);

  const hasWatchResultData = watchResultData !== null && typeof watchResultData === 'object';
  let label = '';

  const mustacheLink = (
    <EuiLink href="https://mustache.github.io/" target="_blank">
      {mustacheLinkLabel}
    </EuiLink>
  );

  // eslint-disable-next-line prettier/prettier
  const htmlLink = !isHTML ? undefined : (
    <EuiLink href="https://developer.mozilla.org/en-US/docs/Web/HTML" target="_blank">
      HTML
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
              body: (
                <EuiFormRow fullWidth label={responseText}>
                  <EuiCodeEditor
                    theme={editorTheme}
                    mode="json"
                    width="100%"
                    height="500px"
                    value={stringifyPretty(watchResultData.runtime_attributes || {})}
                    readOnly
                  />
                </EuiFormRow>
              ),
            },
          });
        }}
      >
        {watchResultsLinkLabel}
      </EuiLink>
    );

    label = actionBodyHelpLabelWithResults(watchResultLink, mustacheLink, htmlLink);
  } else {
    label = actionBodyHelpLabelWithoutResults(mustacheLink, htmlLink);
  }

  return <Fragment>{label}</Fragment>;
};
