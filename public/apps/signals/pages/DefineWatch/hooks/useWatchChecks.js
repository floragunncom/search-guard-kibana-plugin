/* eslint-disable @kbn/eslint/require-license-header */
import { useState, useContext } from 'react';
import { WatchService } from '../../../services';
import { formikToWatch } from '../utils';
import { stringifyPretty } from '../../../utils/helpers';

import { Context } from '../../../Context';

export function useWatchChecks({ setFieldValue, isResultVisibleDefault = false } = {}) {
  const { httpClient, addErrorToast } = useContext(Context);
  const watchService = new WatchService(httpClient);

  const [isLoading, setIsLoading] = useState(false);
  const [isResultVisible, setResultVisible] = useState(isResultVisibleDefault);
  const [editorResult, setEditorResult] = useState(undefined);

  const closeResult = () => setResultVisible(false);

  async function executeWatch({ values, simulate = false, skipActions = true } = {}) {
    setIsLoading(true);

    let watch;
    console.debug('useWatchChecks -- executeWatch -- values', values);

    try {
      watch = formikToWatch(values);
      console.debug('useWatchChecks -- executeWatch -- watch', watch);

      const { ok, resp } = await watchService.execute({ watch, simulate, skipActions });
      console.debug('useWatchChecks -- executeWatch -- resp', resp);

      setFieldValue('_ui.checksResult', resp);
      setEditorResult(stringifyPretty(resp.runtime_attributes ? resp.runtime_attributes : resp));

      if (!ok) throw resp;
    } catch (err) {
      console.error('useWatchChecks -- executeWatch', err);
      console.debug('useWatchChecks -- executeWatch -- values', values);
      console.debug('useWatchChecks -- executeWatch -- watch', watch);
      addErrorToast(err);
    }

    setResultVisible(true);
    setIsLoading(false);
  }

  return { isLoading, isResultVisible, setResultVisible, closeResult, executeWatch, editorResult };
}
