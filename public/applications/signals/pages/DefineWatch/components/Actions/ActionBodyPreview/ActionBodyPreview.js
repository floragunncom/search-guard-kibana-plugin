/* eslint-disable @osd/eslint/require-license-header */
import React from 'react';
import PropTypes from 'prop-types';
import { connect as connectFormik } from 'formik';
import mustache from 'mustache';
import { get, isEmpty } from 'lodash';
import dompurify from 'dompurify';
import { EuiCodeBlock, EuiFormRow } from '@elastic/eui';
import {
  selectConditionToRenderGraphToSeeResultsText,
  executeWatchToSeeResultText,
  previewText,
} from '../../../../../utils/i18n/watch';
import { WATCH_TYPES } from '../../../utils/constants';

const ActionBodyPreview = ({
  template,
  view,
  fullWidth,
  fontSize,
  isHTML,
  formik: { values },
}) => {
  const isGraphWatch = values._ui.watchType === WATCH_TYPES.GRAPH;
  const previewHelpText = isGraphWatch
    ? selectConditionToRenderGraphToSeeResultsText
    : executeWatchToSeeResultText;

  view = isEmpty(view) ? get(values, '_ui.checksResult.runtime_attributes', {}) : view;

  let previewBody;
  try {
    previewBody = mustache.render(template, view);
  } catch (err) {
    previewBody = err.toString();
  }

  return (
    <EuiFormRow
      fullWidth={fullWidth}
      label={previewText}
      helpText={previewHelpText}
      data-test-subj="sgActionBodyPreview"
    >
      {isHTML ? (
        <div
          style={{ backgroundColor: '#F3F6F9', padding: '24px' }}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: `<div>${dompurify.sanitize(previewBody)}</div>` }}
        />
      ) : (
        <EuiCodeBlock
          fontSize={fontSize}
          data-test-subj="sgWatchAction-MustachePreview"
        >
          {previewBody}
        </EuiCodeBlock>
      )}
    </EuiFormRow>
  );
};

ActionBodyPreview.defaultProps = {
  view: {},
  isHTML: false,
  fontSize: 'm',
  fullWidth: true,
};

ActionBodyPreview.propTypes = {
  template: PropTypes.string.isRequired,
  formik: PropTypes.object.isRequired,
  isHTML: PropTypes.bool,
  view: PropTypes.object,
  fontSize: PropTypes.string,
  fullWidth: PropTypes.bool,
};

export default connectFormik(ActionBodyPreview);
