/* eslint-disable @kbn/eslint/require-license-header */
import React, { useState } from 'react';
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

/*
TODO:
  - [x] Develop data model for check blocks.
  - [x] Add DND skeleton.
  - [] Block actions: delete.
  - [] Add check templates from DefinitionPanel.
  - [] Add BlocksWatch to ActionsPanel. Maybe refactor the ActionsPanel.
  - [] Check block forms.
  - [] Slice the check name to deal with long usernames.
  - [] Deletion confirm.
  - [] Other block actions: execute (single and waterfall), disable, etc.
  - [] Execute all blocks. Render stats.
  - [] Make sure check code is pretty in the code editor in forms.
  - [] Maybe resize code editor in forms.
  - [] Unit tests for functions and hooks.
  - [] Put ids for int tests.
  - [] Use i18n.
  - [] Put components in separate files.
*/

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

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

export function StaticCheckBlockForm({ checkBlock }) {
  return (
    <>
      <p>Type: {checkBlock.type}</p>
      <p>Name: {checkBlock.name}</p>
      <p>Target: {checkBlock.target}</p>
      <p>Value: {checkBlock.value}</p>
    </>
  );
}

export function SearchCheckBlockForm({ checkBlock }) {
  return (
    <>
      <p>Type: {checkBlock.type}</p>
      <p>Name: {checkBlock.name}</p>
      <p>Target: {checkBlock.target}</p>
      <p>Request: {checkBlock.request}</p>
    </>
  );
}

export function HttpCheckBlockForm({ checkBlock }) {
  return (
    <>
      <p>Type: {checkBlock.type}</p>
      <p>Name: {checkBlock.name}</p>
      <p>Target: {checkBlock.target}</p>
      <p>Request: {checkBlock.request}</p>
      <p>TLS: {checkBlock.tls}</p>
    </>
  );
}

export function ConditionCheckBlockForm({ checkBlock }) {
  return (
    <>
      <p>Type: {checkBlock.type}</p>
      <p>Name: {checkBlock.name}</p>
      <p>Target: {checkBlock.target}</p>
      <p>Source: {checkBlock.source}</p>
    </>
  );
}

export function TransformCheckBlockForm({ checkBlock }) {
  return (
    <>
      <p>Type: {checkBlock.type}</p>
      <p>Name: {checkBlock.name}</p>
      <p>Target: {checkBlock.target}</p>
      <p>Source: {checkBlock.source}</p>
    </>
  );
}

export function CalcCheckBlockForm({ checkBlock }) {
  return (
    <>
      <p>Type: {checkBlock.type}</p>
      <p>Name: {checkBlock.name}</p>
      <p>Target: {checkBlock.target}</p>
      <p>Source: {checkBlock.source}</p>
    </>
  );
}

export function DraggableBlock({ accordionId, index, provided, checkBlock, onDeleteBlock }) {
  let form;

  switch (checkBlock.type) {
    case STATIC_DEFAULTS.type:
      form = <StaticCheckBlockForm checkBlock={checkBlock} />;
      break;
    case SEARCH_DEFAULTS.type:
      form = <SearchCheckBlockForm checkBlock={checkBlock} />;
      break;
    case HTTP_DEFAULTS.type:
      form = <HttpCheckBlockForm checkBlock={checkBlock} />;
      break;
    case CONDITION_DEFAULTS.type:
      form = <ConditionCheckBlockForm checkBlock={checkBlock} />;
      break;
    case TRANSFORM_DEFAULTS.type:
      form = <TransformCheckBlockForm checkBlock={checkBlock} />;
      break;
    case CALC_DEFAULTS.type:
      form = <CalcCheckBlockForm checkBlock={checkBlock} />;
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
            buttonContent={checkBlock.name}
            extraAction={
              <EuiButton size="s" onClick={() => onDeleteBlock(index)}>
                Delete
              </EuiButton>
            }
            paddingSize="l"
          >
            <div>{form}</div>
          </EuiAccordion>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}

function BlocksWatch({ formik: { values }, accordionId }) {
  const [checksBlocks, setChecksBlocks] = useState(get(values, '_ui.checksBlocks', []));

  function onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    setChecksBlocks(reorder(checksBlocks, result.source.index, result.destination.index));
  }

  function deleteBlock(index) {
    const newCheckBlocks = [...checksBlocks];
    newCheckBlocks.splice(index, 1);
    setChecksBlocks(newCheckBlocks);
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
                            onDeleteBlock={deleteBlock}
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

BlocksWatch.propTypes = {
  accordionId: PropTypes.string.isRequired,
  formik: PropTypes.object.isRequired,
};

export default connectFormik(BlocksWatch);
