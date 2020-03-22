/* eslint-disable @kbn/eslint/require-license-header */
import React, { useState, useContext } from 'react';
import { get } from 'lodash';
import { buildFormikChecks, buildChecks } from '../utils';
import { buildFormikChecksBlocks } from '../components/BlocksWatch/utils';
import { addedCheckTemplateText } from '../../../utils/i18n/watch';
import { WATCH_TYPES } from '../utils/constants';

import { Context } from '../../../Context';

const useCheckTemplates = ({
  setFieldValue,
  // Defaults to watch checks
  // but can accept any checks path, for example, action checks
  checksPath = 'checks',
  checksBlocksPath = '_ui.checksBlocks',
} = {}) => {
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
        const checksBlocks = get(values, checksBlocksPath, []);
        const checkBlock = buildFormikChecksBlocks([template])[0];
        checkBlock.id = checksBlocks.length;

        setFieldValue(checksBlocksPath, [...checksBlocks, checkBlock]);
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
      console.debug('useChecktemplates -- addTemplate -- template', template);
      addErrorToast(error);
    }
  };

  return { addTemplate, setEditorCursorPosition, templateToInsert };
};

export default useCheckTemplates;
