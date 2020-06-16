/* eslint-disable @kbn/eslint/require-license-header */
import React, { useEffect, useContext } from 'react';
import ReactDOM from 'react-dom';
import { connect as connectFormik } from 'formik';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { get } from 'lodash';
import {
  EuiAccordion,
  EuiButton,
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiCallOut,
} from '@elastic/eui';
import {
  STATIC_DEFAULTS,
  SEARCH_DEFAULTS,
  HTTP_DEFAULTS,
  CONDITION_DEFAULTS,
  TRANSFORM_DEFAULTS,
  CALC_DEFAULTS,
} from './utils/checkBlocks';
import { reorderBlocks, deleteBlock, shorterCheckName } from './utils/helpers';
import { EmptyPrompt } from '../../../../../components';
import { StaticCheckBlockForm } from './StaticCheckBlockForm';
import { SearchCheckBlockForm } from './SearchCheckBlockForm';
import { HttpCheckBlockForm } from './HttpCheckBlockForm';
import { ConditionCheckBlockForm } from './ConditionCheckBlockForm';
import { TransformCheckBlockForm } from './TransformCheckBlockForm';
import { CalcCheckBlockForm } from './CalcCheckBlockForm';
import { WatchResponse } from './WatchResponse';
import {
  looksLikeYouDontHaveAnyCheckText,
  noChecksText,
  deleteText,
} from '../../../../utils/i18n/watch';

import { Context } from '../../../../Context';

/*
TODO:
  - [x] Develop data model for check blocks.
  - [x] Add DND skeleton.
  - [x] Block actions: delete.
  - [x] Add check templates from DefinitionPanel.
  - [x] Default name for a new block
  - [x] excution works in Json watch
  - [x] execution works in Blocks watch
  - [x] Develop data model for check blocks in actions.
  - [x] Add BlocksWatch to ActionsPanel. Maybe refactor the ActionsPanel.
  - [] Check block forms:
    - [] Static
    - [] Condition
    - [] Transform
    - [] Calc
    - [] Search
    - [] HTTP
  - [] Resize form capability https://elastic.github.io/eui/#/layout/resizable-container
  - [x] Slice the check name to deal with long usernames.
  - [x] Deletion confirm.
  - [] Other block actions: execute (single and waterfall), disable, etc.
  - [] Execute all blocks. Render stats.
  - [] Make sure check code is pretty in the code editor in forms.
  - [] Maybe resize code editor in forms.
  - [] Unit tests for functions and hooks.
  - [] Put ids for int tests.
  - [] Use i18n.
  - [x] Put components in separate files.
  - [] Bug. QueryStat. No _shards found in the watch execution response
  - [] The graph watch doesn't have checks in actions. Make sure you delete the action's checks
  when switch to the graph mode.
*/

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

export function DraggableBlock({
  accordionId,
  index,
  provided,
  checkBlock,
  checksBlocksPath,
  onDeleteBlock,
  onCloseResult,
}) {
  let form;

  switch (checkBlock.type) {
    case STATIC_DEFAULTS.type:
      form = (
        <StaticCheckBlockForm
          index={index}
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
      <EuiButton size="s" onClick={() => onDeleteBlock(index)}>
        Delete
      </EuiButton>
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
  accordionId: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  provided: PropTypes.object.isRequired,
  checkBlock: PropTypes.object.isRequired,
  checksBlocksPath: PropTypes.string.isRequired,
  onDeleteBlock: PropTypes.func.isRequired,
  onCloseResult: PropTypes.func.isRequired,
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
  const { editorTheme, triggerConfirmModal } = useContext(Context);
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
    setFieldValue(`checksBlocksPath[${index}].response`, '');
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
                            {...provided.dragHandleProps}
                            style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                          >
                            <DraggableBlock
                              accordionId={accordionId}
                              index={index}
                              provided={provided}
                              checkBlock={checkBlock}
                              checksBlocksPath={checksBlocksPath}
                              onDeleteBlock={handleDeleteBlock}
                              onCloseResult={() => clearResponse(index)}
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
