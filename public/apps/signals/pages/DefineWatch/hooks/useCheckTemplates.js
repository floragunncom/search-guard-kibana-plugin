import React, { useState, useContext } from 'react';
import { get } from 'lodash';
import { buildFormikChecks, buildChecks, buildFormikChecksBlocks } from '../utils';
import { addedCheckTemplateText } from '../../../utils/i18n/watch';
import { WATCH_TYPES } from '../utils/constants';

import { Context } from '../../../Context';

const useCheckTemplates = ({ setFieldValue, checksPath = 'checks' } = {}) => {
  const { addSuccessToast, addErrorToast } = useContext(Context);

  // Template insert works only in JsonWatch
  const [templateToInsert, setTemplateToInsert] = useState({
    text: undefined, // Template is not inserted if at least one value is undefined
    row: undefined,
    column: undefined,
  });

  const setEditorCursorPosition = ({ row, column }) => {
    setTemplateToInsert({ row, column });
  };

  const addTemplate = ({ template, values }) => {
    const watchType = get(values, '_ui.watchType', WATCH_TYPES.GRAPH);

    try {
      if (watchType === WATCH_TYPES.BLOCKS) {
        const checksBlocks = get(values, '_ui.checksBlocks', []);
        const checkBlock = buildFormikChecksBlocks([template])[0];
        checkBlock.id = checksBlocks.length;

        setFieldValue('_ui.checksBlocks', [...checksBlocks, checkBlock]);
      } else {
        const isInserting =
          Number.isInteger(templateToInsert.row) && Number.isInteger(templateToInsert.column);

        if (isInserting) {
          // TODO: currently inserting techique is not very convenient
          // Not used now.
          setTemplateToInsert(prevState => ({
            ...prevState,
            text: buildFormikChecks(template) + '\n',
          }));
        } else {
          const checks = buildFormikChecks([
            ...buildChecks({ checks: get(values, checksPath, ''), _ui: values._ui }),
            template,
          ]);
          setFieldValue(checksPath, checks);
        }
      }

      addSuccessToast(<p>{addedCheckTemplateText}</p>);
    } catch (error) {
      console.error('useCheckTemplates', error);
      console.debug('useChecktemplates -- template', template);
      addErrorToast(error);
    }
  };

  return { addTemplate, setEditorCursorPosition, templateToInsert };
};

export default useCheckTemplates;
