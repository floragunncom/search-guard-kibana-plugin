import { useState, useContext } from 'react';
import { WatchService } from '../../../services';
import { formikToWatch } from '../utils';
import { stringifyPretty } from '../../../utils/helpers';

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

    setIsLoading(true);

    let watch;
    try {
      watch = formikToWatch(values);
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

  return { isLoading, isResultVisible, closeResult, executeWatch, editorResult };
};

export default useJsonWatchChecks;
