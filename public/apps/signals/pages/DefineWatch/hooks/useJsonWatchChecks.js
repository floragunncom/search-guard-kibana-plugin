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
    setIsLoading(true);

    try {
      const { ok, resp } = await watchService.execute({
        watch: formikToWatch(values),
        simulate,
        skipActions,
      });

      setFieldValue('_ui.checksResult', resp);
      setEditorResult(stringifyPretty(resp));
      if (!ok) throw resp;
    } catch (error) {
      console.error('useJsonWatchChecks', error);
      console.debug('useJsonWatchChecks -- values', values);
      addErrorToast(error);
    }

    setIsLoading(false);
    setResultVisible(true);
  };

  return { isLoading, isResultVisible, closeResult, executeWatch, editorResult };
};

export default useJsonWatchChecks;
