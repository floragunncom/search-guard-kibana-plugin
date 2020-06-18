/* eslint-disable @kbn/eslint/require-license-header */
import React, { useEffect, useContext, useState } from 'react';
import ReactDOM from 'react-dom';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { get, set, cloneDeep } from 'lodash';
import {
  EuiAccordion,
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiCallOut,
  EuiButtonIcon,
  EuiToolTip,
  EuiLoadingSpinner,
} from '@elastic/eui';
import { EmptyPrompt } from '../../../../../components';
import {
  StaticCheckBlockForm,
  HttpCheckBlockForm,
  SearchCheckBlockForm,
  ConditionCheckBlockForm,
  TransformCheckBlockForm,
  CalcCheckBlockForm,
  WatchResponse,
} from './forms';
import { WatchService } from '../../../../services';
import { reorderBlocks, deleteBlock, shorterCheckName } from './utils/helpers';
import { formikToWatch } from '../../utils';
import {
  STATIC_DEFAULTS,
  SEARCH_DEFAULTS,
  HTTP_DEFAULTS,
  CONDITION_DEFAULTS,
  TRANSFORM_DEFAULTS,
  CALC_DEFAULTS,
} from './utils/checkBlocks';
import { stringifyPretty } from '../../../../utils/helpers';
import {
  looksLikeYouDontHaveAnyCheckText,
  noChecksText,
  deleteText,
  executeBlocksAboveAndThisBlockText,
  executeOnlyThisBlockText,
  executeText,
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

export function DraggableBlockExtraButton({ isLoading, toolTipProps, buttonProps }) {
  return (
    <EuiToolTip {...toolTipProps}>
      {isLoading ? <EuiLoadingSpinner size="m" /> : <EuiButtonIcon {...buttonProps} />}
    </EuiToolTip>
  );
}

export function DraggableBlock({
  values,
  isLoading,
  accordionId,
  index,
  provided,
  checkBlock,
  checksBlocksPath,
  onDeleteBlock,
  onCloseResult,
  onExecuteBlock,
}) {
  let form;

  switch (checkBlock.type) {
    case STATIC_DEFAULTS.type:
      form = (
        <StaticCheckBlockForm
          index={index}
          values={values}
          checkBlock={checkBlock}
          checksBlocksPath={checksBlocksPath}
          onCloseResult={onCloseResult}
        />
      );
      break;
    case SEARCH_DEFAULTS.type:
      form = (
        <SearchCheckBlockForm
          index={index}
          values={values}
          checkBlock={checkBlock}
          checksBlocksPath={checksBlocksPath}
          onCloseResult={onCloseResult}
        />
      );
      break;
    case HTTP_DEFAULTS.type:
      form = (
        <HttpCheckBlockForm
          index={index}
          values={values}
          checkBlock={checkBlock}
          checksBlocksPath={checksBlocksPath}
          onCloseResult={onCloseResult}
        />
      );
      break;
    case CONDITION_DEFAULTS.type:
      form = (
        <ConditionCheckBlockForm
          index={index}
          values={values}
          checkBlock={checkBlock}
          checksBlocksPath={checksBlocksPath}
          onCloseResult={onCloseResult}
        />
      );
      break;
    case TRANSFORM_DEFAULTS.type:
      form = (
        <TransformCheckBlockForm
          index={index}
          values={values}
          checkBlock={checkBlock}
          checksBlocksPath={checksBlocksPath}
          onCloseResult={onCloseResult}
        />
      );
      break;
    case CALC_DEFAULTS.type:
      form = (
        <CalcCheckBlockForm
          index={index}
          values={values}
          checkBlock={checkBlock}
          checksBlocksPath={checksBlocksPath}
          onCloseResult={onCloseResult}
        />
      );
      break;
    default:
      form = (
        <EuiCallOut
          title={`Wrong check type "${checkBlock.type}"`}
          color="danger"
          iconType="alert"
        />
      );
      break;
  }

  function renderExtraAction() {
    return (
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <DraggableBlockExtraButton
            toolTipProps={{
              title: executeText,
              content: executeBlocksAboveAndThisBlockText,
            }}
            buttonProps={{
              'aria-label': 'execute-cascade',
              iconType: 'play',
              onClick: () => onExecuteBlock(0, index),
            }}
            isLoading={isLoading}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <DraggableBlockExtraButton
            toolTipProps={{
              title: executeText,
              content: executeOnlyThisBlockText,
            }}
            buttonProps={{
              'aria-label': 'execute',
              iconType: 'bullseye',
              onClick: () => onExecuteBlock(index),
            }}
            isLoading={isLoading}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <DraggableBlockExtraButton
            toolTipProps={{
              title: deleteText,
            }}
            buttonProps={{
              'aria-label': 'delete',
              iconType: 'trash',
              color: 'danger',
              onClick: () => onDeleteBlock(index),
            }}
            isLoading={isLoading}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  return (
    <EuiPanel>
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <div {...provided.dragHandleProps}>
            <EuiIcon type="grab" />
          </div>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiAccordion
            id={accordionId}
            buttonContent={shorterCheckName(checkBlock.name)}
            extraAction={renderExtraAction()}
            paddingSize="l"
          >
            <div>{form}</div>
          </EuiAccordion>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}

DraggableBlock.propTypes = {
  values: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
  accordionId: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  provided: PropTypes.object.isRequired,
  checkBlock: PropTypes.object.isRequired,
  checksBlocksPath: PropTypes.string.isRequired,
  onDeleteBlock: PropTypes.func.isRequired,
  onCloseResult: PropTypes.func.isRequired,
  onExecuteBlock: PropTypes.func.isRequired,
};

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
      <div style={{ overflowX: 'hidden' }}>
        <EuiPanel paddingSize="none">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div
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
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                          >
                            <DraggableBlock
                              values={values}
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
    <div>
      {isResultVisible && (
        <WatchResponse
          onCloseResult={onCloseResult}
          editorTheme={editorTheme}
          editorResult={editorResult}
        />
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
