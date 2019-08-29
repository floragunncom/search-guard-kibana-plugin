import React from 'react';
import PropTypes from 'prop-types';
import { connect as connectFormik } from 'formik';
import mustache from 'mustache';
import { get, isEmpty } from 'lodash';
import { EuiCodeBlock, EuiFormRow } from '@elastic/eui';
import {
  selectConditionToRenderGraphToSeeResultsText,
  executeWatchToSeeResultText,
  previewText
} from '../../../../../utils/i18n/watch';
import { WATCH_TYPE } from '../../../utils/constants';

const ActionBodyPreview = ({
  index,
  template = '',
  view = {},
  fullWidth = true,
  fontSize = 'm',
  language = 'html',
  formik: { values }
}) => {
  const isGraphWatch = values._watchType === WATCH_TYPE.GRAPH;
  const previewHelpText = isGraphWatch
    ? selectConditionToRenderGraphToSeeResultsText
    : executeWatchToSeeResultText;

  const _template = isEmpty(template) ? get(values, `actions[${index}].request.body`) : template;
  const _view = isEmpty(view) ? { data: values._checksResult } : { data: view };

  let previewBody;
  try {
    previewBody = mustache.render(_template, _view);
  } catch (err) {
    previewBody = err.toString();
  }

  return (
    <EuiFormRow
      fullWidth={fullWidth}
      label={previewText}
      helpText={previewHelpText}
    >
      <EuiCodeBlock
        fontSize={fontSize}
        language={language}
        data-test-subj="sgWatchAction-MustachePreview"
      >
        {previewBody}
      </EuiCodeBlock>
    </EuiFormRow>
  );
};

ActionBodyPreview.propTypes = {
  template: PropTypes.string,
  view: PropTypes.object,
  language: PropTypes.string,
  fontSize: PropTypes.string,
  fullWidth: PropTypes.bool,
  index: PropTypes.number.isRequired,
  formik: PropTypes.object.isRequired
};

export default connectFormik(ActionBodyPreview);
