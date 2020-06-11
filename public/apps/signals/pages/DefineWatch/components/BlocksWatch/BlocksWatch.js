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
} from '@elastic/eui';
import {
  STATIC_DEFAULTS,
  SEARCH_DEFAULTS,
  HTTP_DEFAULTS,
  CONDITION_DEFAULTS,
  TRANSFORM_DEFAULTS,
  CALC_DEFAULTS,
} from './utils/checkBlocks';

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

export function DraggableBlock({ provided, checkBlock }) {
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
      form = <p>Unknown check type</p>;
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
            buttonContent={'Click to open'}
            extraAction={<EuiButton size="s">Extra action!</EuiButton>}
            paddingSize="l"
          >
            <div>{form}</div>
          </EuiAccordion>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}

function BlocksWatch({ formik: { values } }) {
  // const [items, setItems] = useState(getItems(10));
  const [items, setItems] = useState(get(values, '_ui.checksBlocks', []));

  function onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    setItems(reorder(items, result.source.index, result.destination.index));
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
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => {
                      return openPortal(
                        provided.draggableProps.style,
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                        >
                          <DraggableBlock provided={provided} checkBlock={item} />
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
  formik: PropTypes.object.isRequired,
};

export default connectFormik(BlocksWatch);
