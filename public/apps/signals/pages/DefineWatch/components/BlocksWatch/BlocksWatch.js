/* eslint-disable @kbn/eslint/require-license-header */
import React, { useEffect, useContext, useState } from 'react';
import ReactDOM from 'react-dom';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { get, set, cloneDeep } from 'lodash';
import { EuiPanel, EuiSpacer } from '@elastic/eui';
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

const grid = 2;

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  ...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? '#bfdcd9' : '#ffffff',
  padding: grid,
  width: '100%',
});

function BlocksWatch({
  formik: { values, setFieldValue },
  accordionId,
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

    const formik = cloneDeep(values);
    try {
      set(formik, checksBlocksPath, checksBlocks.slice(startIndex, endIndex + 1));
      const { ok, resp } = await watchService.execute({ watch: formikToWatch(formik) });
      setFieldValue(`${checksBlocksPath}.${endIndex}.response`, stringifyPretty(resp));

      if (!ok) throw resp;
    } catch (error) {
      console.error('BlocksWatch -- executeBlocks', error);
      console.debug('BlocksWatch -- executeBlocks -- values', values);
      console.debug('BlocksWatch -- executeBlocks -- values with sliced checks', formik);
      addErrorToast(error);
    }

    setIsLoading(false);
  }

  /*
    Drag And Drop (DND) functionality relies on searchguardDragAndDropPortalAnchor"
    Because Eui accordion item visually brakes DND dragging capability applying transform.
    https://github.com/elastic/eui/issues/3548
  */
  function openPortal(style, element) {
    if (style.position === 'fixed') {
      return ReactDOM.createPortal(
        element,
        document.getElementById('searchguardDragAndDropPortalAnchor')
      );
    }
    return element;
  }

  function renderDNDList() {
    return (
      <div style={{ overflowX: 'hidden' }} id={`${sgBlocksWatchId}-dnd`}>
        <EuiPanel paddingSize="none">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div
                  id={`${sgBlocksWatchId}-dnd-droppable`}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {checksBlocks.map((checkBlock, index) => (
                    <Draggable key={checkBlock.id} draggableId={checkBlock.id} index={index}>
                      {(provided, snapshot) => {
                        return openPortal(
                          provided.draggableProps.style,
                          <div
                            id={`${sgBlocksWatchId}-dnd-draggable`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                          >
                            <CheckBlock
                              sgBlocksWatchId={sgBlocksWatchId}
                              isLoading={isLoading}
                              accordionId={accordionId}
                              index={index}
                              provided={provided}
                              checkBlock={checkBlock}
                              checksBlocksPath={checksBlocksPath}
                              onDeleteBlock={handleDeleteBlock}
                              onCloseResult={() => clearResponse(index)}
                              onExecuteBlock={executeBlocks}
                            />
                          </div>
                        );
                      }}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </EuiPanel>
      </div>
    );
  }

  return (
    <div id={sgBlocksWatchId}>
      {isResultVisible && (
        <>
          <WatchResponse
            onCloseResult={onCloseResult}
            editorTheme={editorTheme}
            editorResult={editorResult}
          />
          <EuiSpacer />
        </>
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
  );
}

BlocksWatch.propTypes = {
  formik: PropTypes.object.isRequired,
  accordionId: PropTypes.string.isRequired,
  checksBlocksPath: PropTypes.string.isRequired,
  isResultVisible: PropTypes.bool.isRequired,
  onCloseResult: PropTypes.func.isRequired,
  onOpenChecksTemplatesFlyout: PropTypes.func.isRequired,
  editorResult: PropTypes.string,
};

export default connectFormik(BlocksWatch);
