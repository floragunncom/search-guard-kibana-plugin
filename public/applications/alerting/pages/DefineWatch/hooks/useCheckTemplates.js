/* eslint-disable @osd/eslint/require-license-header */
import React, { useContext } from 'react';
import { get } from 'lodash';
import {
  buildFormikChecksBlocks,
  buildChecksFromChecksBlocks,
  buildFormikChecks,
  buildChecksFromFormikChecks,
} from '../utils';
import { addedCheckTemplateText } from '../../../utils/i18n/watch';
import { WATCH_TYPES } from '../utils/constants';

import { Context } from '../../../Context';

export function getFormikChecksPlusTemplate({ template, values, checksPath }) {
  if (!checksPath) {
    throw new Error(
      'You must provide checksPath, for example: checks, _ui.checksBlocks, action[0].checks or action[0].checksBlocks'
    );
  }

  const watchType = get(values, '_ui.watchType', WATCH_TYPES.GRAPH);
  let formikChecks;

  if (watchType === WATCH_TYPES.BLOCKS) {
    const rawChecks = buildChecksFromChecksBlocks(get(values, checksPath, '[]'));
    formikChecks = buildFormikChecksBlocks([...rawChecks, template]);
  } else if (watchType === WATCH_TYPES.GRAPH) {
    const rawChecks = buildChecksFromFormikChecks(get(values, checksPath, '[]'));
    formikChecks = buildFormikChecks([...rawChecks, template]);
  } else {
    throw new Error(`Wrong watch type "${watchType}"`);
  }

  return formikChecks;
}

export function useCheckTemplates({ setFieldValue, checksPath }) {
  const { addSuccessToast, addErrorToast } = useContext(Context);

  function addTemplate({ template, values }) {
    try {
      setFieldValue(checksPath, getFormikChecksPlusTemplate({ values, template, checksPath }));
      addSuccessToast(<p>{addedCheckTemplateText}</p>);
    } catch (error) {
      console.error('useCheckTemplates -- addTemplate', error);
      console.debug('useChecktemplates -- addTemplate -- template, values', template, values);
      addErrorToast(error);
    }
  }

  return { addTemplate };
}
