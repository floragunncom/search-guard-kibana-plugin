/* eslint-disable @kbn/eslint/require-license-header */
import React, { useEffect, useContext, useState } from 'react';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { get, set, cloneDeep } from 'lodash';
import {
  EuiPanel,
  EuiSpacer,
  EuiDroppable,
  EuiDraggable,
  EuiDragDropContext,
  EuiErrorBoundary,
} from '@elastic/eui';
import { EmptyPrompt } from '../../../../../components';
import { CheckBlock } from './CheckBlock';
import { WatchResponse } from './forms';
import { WatchService } from '../../../../services';
import { reorderBlocks, deleteBlock } from './utils/helpers';
import { formikToWatch } from '../../utils';
import { stringifyPretty } from '../../../../utils/helpers';
import {
  looksLikeYouDontHaveAnyCheckText,
  noChecksText,
  deleteText,
} from '../../../../utils/i18n/watch';

import { Context } from '../../../../Context';

function BlocksWatch({
  formik: { values, setFieldValue },
  checksBlocksPath,
  isResultVisible,
  onCloseResult,
  onOpenChecksTemplatesFlyout,
  editorResult,
}) {
  const { editorTheme, triggerConfirmModal, addErrorToast, httpClient } = useContext(Context);
  const [isLoading, setIsLoading] = useState(false);
  const watchService = new WatchService(httpClient);
  const checksBlocks = get(values, checksBlocksPath, []);
  const sgBlocksWatchId = `sgBlocksWatch-${checksBlocksPath}`;

  useEffect(() => {
    onCloseResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setChecksBlocks(values) {
    setFieldValue(checksBlocksPath, values);
  }

  function onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    setChecksBlocks(reorderBlocks(checksBlocks, result.source.index, result.destination.index));
  }

  function handleDeleteBlock(index) {
    triggerConfirmModal({
      body: <p>{deleteText}?</p>,
      onConfirm: () => {
        setChecksBlocks(deleteBlock(checksBlocks, index));
        triggerConfirmModal(null);
      },
      onCancel: () => {
        triggerConfirmModal(null);
      },
    });
  }

  function clearResponse(index) {
    setFieldValue(`${checksBlocksPath}[${index}].response`, '');
  }

  async function executeBlocks(startIndex, endIndex) {
    setIsLoading(true);

    if (!endIndex) {
      endIndex = startIndex;
    }

    let formik;
    let watch;

    try {
      formik = cloneDeep(values);
      console.debug('BlocksWatch -- executeBlocks -- values', formik);

      set(formik, checksBlocksPath, checksBlocks.slice(startIndex, endIndex + 1));
      console.debug('BlocksWatch -- executeBlocks -- values, sliced checks', formik);

      watch = formikToWatch(formik);
      console.debug('BlocksWatch -- executeBlocks -- watch', watch);

      const { ok, resp } = await watchService.execute({ watch });
      console.debug('BlocksWatch -- executeBlocks -- resp', resp);

      setFieldValue(
        `${checksBlocksPath}.${endIndex}.response`,
        stringifyPretty(resp.runtime_attributes ? resp.runtime_attributes : resp)
      );

      if (!ok) throw resp;
    } catch (error) {
      console.error('BlocksWatch -- executeBlocks', error);
      console.debug('BlocksWatch -- executeBlocks -- values', formik);
      console.debug('BlocksWatch -- executeBlocks -- values, sliced checks', formik);
      console.debug('BlocksWatch -- executeBlocks -- watch', watch);
      addErrorToast(error);
    }

    setIsLoading(false);
  }

  function renderDNDList() {
    return (
      <EuiDragDropContext onDragEnd={onDragEnd}>
        <EuiDroppable droppableId={`${sgBlocksWatchId}-dnd-droppable`} spacing="m" withPanel>
          {checksBlocks.map((checkBlock, index) => (
            <EuiDraggable
              spacing="m"
              index={index}
              key={checkBlock.id}
              draggableId={checkBlock.id}
              customDragHandle
            >
              {(provided) => {
                return (
                  <CheckBlock
                    sgBlocksWatchId={sgBlocksWatchId}
                    isLoading={isLoading}
                    index={index}
                    provided={provided}
                    checkBlock={checkBlock}
                    checksBlocksPath={checksBlocksPath}
                    onDeleteBlock={handleDeleteBlock}
                    onCloseResult={() => clearResponse(index)}
                    onExecuteBlock={executeBlocks}
                  />
                );
              }}
            </EuiDraggable>
          ))}
        </EuiDroppable>
      </EuiDragDropContext>
    );
  }

  return (
    <EuiErrorBoundary>
      <div id={sgBlocksWatchId}>
        {isResultVisible && (
          <EuiErrorBoundary>
            <WatchResponse
              onCloseResult={onCloseResult}
              editorTheme={editorTheme}
              editorResult={editorResult}
            />
            <EuiSpacer />
          </EuiErrorBoundary>
        )}

        {!checksBlocks.length ? (
          <EuiPanel>
            <EmptyPrompt
              titleText={noChecksText}
              bodyText={looksLikeYouDontHaveAnyCheckText}
              onCreate={onOpenChecksTemplatesFlyout}
            />
          </EuiPanel>
        ) : (
          renderDNDList()
        )}
      </div>
    </EuiErrorBoundary>
  );
}

BlocksWatch.propTypes = {
  formik: PropTypes.object.isRequired,
  checksBlocksPath: PropTypes.string.isRequired,
  isResultVisible: PropTypes.bool.isRequired,
  onCloseResult: PropTypes.func.isRequired,
  onOpenChecksTemplatesFlyout: PropTypes.func.isRequired,
  editorResult: PropTypes.string,
};

export default connectFormik(BlocksWatch);
