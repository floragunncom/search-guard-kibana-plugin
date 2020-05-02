/* eslint-disable @kbn/eslint/require-license-header */
import { useState, useContext } from 'react';
import { get } from 'lodash';
import update from 'immutability-helper';
import { WatchService } from '../../../services';
import { formikToWatch } from '../utils';
import { stringifyPretty } from '../../../utils/helpers';
import { WATCH_TYPES } from '../utils/constants';

import { Context } from '../../../Context';

const useJsonWatchChecks = ({ setFieldValue, isResultVisibleDefault = false } = {}) => {
  const { httpClient, addErrorToast } = useContext(Context);
  const watchService = new WatchService(httpClient);

  const [isLoading, setIsLoading] = useState(false);
  const [isResultVisible, setResultVisible] = useState(isResultVisibleDefault);
  const [editorResult, setEditorResult] = useState(undefined);

  const closeResult = () => setResultVisible(false);

  const executeWatch = async ({ values, simulate = false, skipActions = true } = {}) => {
    console.debug('useJsonWatchChecks -- executeWatch -- values', values);
    const watchType = get(values, '_ui.watchType', WATCH_TYPES.GRAPH);
    const checksBlocks = get(values, '_ui.checksBlocks', []);

    setIsLoading(true);

    let watch;
    try {
      let newValues;
      if (watchType === WATCH_TYPES.BLOCKS) {
        newValues = update(values, {
          _ui: { checksBlocks: { $set: checksBlocks.slice(0, checksBlocks.length + 1) } },
        });
      } else {
        newValues = values;
      }

      watch = formikToWatch(newValues);
      console.debug('useJsonWatchChecks -- executeWatch -- watch', watch);

      const { ok, resp } = await watchService.execute({ watch, simulate, skipActions });

      setFieldValue('_ui.checksResult', resp);
      setEditorResult(stringifyPretty(resp));

      if (!ok) throw resp;
    } catch (error) {
      console.error('useJsonWatchChecks -- executeWatch', error);
      addErrorToast(error);
    }

    console.debug('useJsonWatchChecks -- executeWatch -- watch', watch);

    setIsLoading(false);
    setResultVisible(true);
  };

  return { isLoading, isResultVisible, setResultVisible, closeResult, executeWatch, editorResult };
};

export default useJsonWatchChecks;
